/**
 * External dependencies
 *
 * @format
 */
import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { moment, localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getPreference } from 'state/preferences/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import List from './list';
import QueryPreferences from 'components/data/query-preferences';
import QuerySiteStats from 'components/data/query-site-stats';
import { savePreference } from 'state/preferences/actions';
import SelectDropdown from 'components/select-dropdown';
import Stat from './stat';

import { getUnitPeriod, getStartDate } from 'woocommerce/app/store-stats/utils';
import { UNITS, dashboardListLimit } from 'woocommerce/app/store-stats/constants';

class StatsWidget extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			name: PropTypes.string.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	};

	handleTimePeriodChange = option => {
		const { saveDashboardTimePeriod } = this.props;
		saveDashboardTimePeriod( option.value );
	};

	dateForDisplay = () => {
		const { translate, dashboardTimePeriod } = this.props;

		const localizedDate = moment( moment().format( 'YYYY-MM-DD' ) );
		let formattedDate;
		switch ( dashboardTimePeriod ) {
			case 'week':
				formattedDate = translate( '%(startDate)s - %(endDate)s', {
					context: 'Date range for which stats are being displayed',
					args: {
						// LL is a date localized by momentjs
						startDate: localizedDate
							.startOf( 'week' )
							.add( 1, 'd' )
							.format( 'LL' ),
						endDate: localizedDate
							.endOf( 'week' )
							.add( 1, 'd' )
							.format( 'LL' ),
					},
				} );
				break;

			case 'month':
				formattedDate = localizedDate.format( 'MMMM YYYY' );
				break;

			case 'year':
				formattedDate = localizedDate.format( 'YYYY' );
				break;

			default:
				// LL is a date localized by momentjs
				formattedDate = localizedDate.format( 'LL' );
		}

		return formattedDate;
	};

	renderTitle = () => {
		const { site, translate, dashboardTimePeriod } = this.props;

		const options = [
			{ value: 'day', label: 'day' },
			{ value: 'week', label: 'week' },
			{ value: 'month', label: 'month' },
		];

		const dateDisplay = this.dateForDisplay();

		return (
			<Fragment>
				<span>
					{ translate( '%(siteName)s in the last {{timePeriodSelector/}}', {
						args: { siteName: site.name },
						components: {
							timePeriodSelector: (
								<SelectDropdown
									options={ options }
									initialSelected={ dashboardTimePeriod }
									onSelect={ this.handleTimePeriodChange }
								/>
							),
						},
						context:
							'Store stats dashboard widget title. Example: "Your Site in the last day|week|month.".',
					} ) }
				</span>
				<p>{ dateDisplay }</p>
			</Fragment>
		);
	};

	renderOrders = () => {
		const { site, translate, dashboardTimePeriod } = this.props;
		return (
			<Stat
				site={ site }
				unit={ dashboardTimePeriod }
				label={ translate( 'Orders' ) }
				stat="statsOrders"
				attribute="orders"
				type="number"
			/>
		);
	};

	renderSales = () => {
		const { site, translate, dashboardTimePeriod } = this.props;
		return (
			<Stat
				site={ site }
				unit={ dashboardTimePeriod }
				label={ translate( 'Sales' ) }
				stat="statsOrders"
				attribute="total_sales"
				type="currency"
			/>
		);
	};

	renderVisitors = () => {
		return <div className="stats-widget__box-contents">Visitors</div>;
	};

	renderConversionRate = () => {
		return <div className="stats-widget__box-contents">Conversion Rates</div>;
	};

	renderReferrers = () => {
		const { site, translate, dashboardTimePeriod } = this.props;

		const values = [
			{ key: 'referrer', title: translate( 'Referrer' ), format: 'text' },
			{ key: 'product_views', title: translate( 'Referrals' ), format: 'text' },
			{ key: 'sales', title: translate( 'Sales' ), format: 'currency' },
		];

		return (
			<List
				site={ site }
				statSlug="referrers"
				statType="statsStoreReferrers"
				unit={ dashboardTimePeriod }
				values={ values }
				emptyMessage={ translate( 'No referral activity has been recorded for this time period.' ) }
			/>
		);
	};

	renderProducts = () => {
		const { site, translate, dashboardTimePeriod } = this.props;

		const values = [
			{ key: 'name', title: translate( 'Product' ), format: 'text' },
			{ key: 'total', title: translate( 'Sales' ), format: 'currency' },
		];

		return (
			<List
				site={ site }
				statSlug="products"
				statType="statsTopEarners"
				unit={ dashboardTimePeriod }
				values={ values }
				emptyMessage={ translate( 'No products have been sold in this time period.' ) }
			/>
		);
	};

	queries = () => {
		const { site, dashboardTimePeriod } = this.props;

		const unitOrderAndReferrerDate = getUnitPeriod(
			getStartDate( moment().format( 'YYYY-MM-DD' ), dashboardTimePeriod ),
			dashboardTimePeriod
		);

		const orderQuery = {
			unit: dashboardTimePeriod,
			date: unitOrderAndReferrerDate,
			quantity: UNITS[ dashboardTimePeriod ].quantity,
		};

		const referrerQuery = {
			unit: dashboardTimePeriod,
			date: unitOrderAndReferrerDate,
			quantity: 1,
		};

		const unitDate = getUnitPeriod( moment().format( 'YYYY-MM-DD' ), dashboardTimePeriod );
		const query = {
			unit: dashboardTimePeriod,
			date: unitDate,
			limit: dashboardListLimit,
		};

		return (
			<Fragment>
				<QueryPreferences />
				<QuerySiteStats statType="statsOrders" siteId={ site.ID } query={ orderQuery } />
				<QuerySiteStats statType="statsTopEarners" siteId={ site.ID } query={ query } />
				<QuerySiteStats statType="statsStoreReferrers" siteId={ site.ID } query={ referrerQuery } />
			</Fragment>
		);
	};

	render() {
		const { site, translate } = this.props;
		return (
			<div className="stats-widget">
				{ this.queries() }
				<DashboardWidget title={ this.renderTitle() }>
					<div className="stats-widget__boxes">
						{ this.renderOrders() }
						{ this.renderSales() }
						{ this.renderVisitors() }
						{ this.renderConversionRate() }
						{ this.renderReferrers() }
						{ this.renderProducts() }
					</div>

					<div className="stats-widget__footer">
						<span>
							{ translate(
								"You can view more detailed stats and reports on your site's main dashboard."
							) }
						</span>
						<a href={ getLink( '/store/stats/orders/day/:site', site ) }>
							{ translate( 'View full stats' ) }
						</a>
					</div>
				</DashboardWidget>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const dashboardTimePeriod = getPreference( state, 'store-dashboardStatsWidgetTimePeriod' );
	return {
		site,
		dashboardTimePeriod,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			saveDashboardTimePeriod: value =>
				savePreference( 'store-dashboardStatsWidgetTimePeriod', value ),
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( StatsWidget ) );
