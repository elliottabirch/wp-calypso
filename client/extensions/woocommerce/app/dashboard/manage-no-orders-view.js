/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import DashboardWidgetRow from 'woocommerce/components/dashboard-widget/row';
import { getLink } from 'woocommerce/lib/nav-utils';
import ShareWidget from 'woocommerce/components/share-widget';
import { recordTrack } from 'woocommerce/lib/analytics';
import QuerySettingsProducts from 'woocommerce/components/query-settings-products';
import { getProductsSettingValue } from 'woocommerce/state/sites/settings/products/selectors';

class ManageNoOrdersView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
	};

	renderShareWidget = () => {
		const { site, translate } = this.props;
		return (
			<ShareWidget
				text={ translate(
					'Your store is ready to take orders - congratulations! ' +
						'Spread the word to get orders rolling in.'
				) }
				title={ translate( 'Your store is ready, the world awaits!' ) }
				urlToShare={ site.URL }
			/>
		);
	};

	renderStatsWidget = () => {
		const { site, translate } = this.props;
		const trackClick = () => {
			recordTrack( 'calypso_woocommerce_dashboard_action_click', {
				action: 'view-stats',
			} );
			page.redirect( getLink( '/store/stats/orders/day/:site', site ) );
		};
		return (
			<DashboardWidget
				className="dashboard__stats-widget"
				image="/calypso/images/extensions/woocommerce/woocommerce-sample-graph.svg"
				imagePosition="bottom"
				imageFlush
				title={ translate( 'Looking for stats?' ) }
			>
				<p>
					{ translate(
						'Store statistics and reports can be found on the site stats screen.' +
							' Keep an eye on revenue, order totals, popular products, and more.'
					) }
				</p>
				<Button onClick={ trackClick }>{ translate( 'View stats' ) }</Button>
			</DashboardWidget>
		);
	};

	renderViewAndTestWidget = () => {
		const { site, translate, shopPageId } = this.props;
		const trackClick = () => {
			recordTrack( 'calypso_woocommerce_dashboard_action_click', {
				action: 'view-and-test',
			} );
		};

		const shopUrl = shopPageId && site.URL + '?p=' + shopPageId;

		return (
			<DashboardWidget
				className="dashboard__view-and-test-widget"
				title={ translate( 'Test all the things' ) }
			>
				<p>
					{ translate(
						'Your store is live! It’s a good idea to double check' +
							' your tax, shipping, and payment configurations are set up correctly.'
					) }
				</p>
				<p>
					{ translate(
						'The easiest way to do this is to view your store, add' +
							' a product to your cart, and attempt to check out using different addresses.'
					) }
				</p>
				<Button onClick={ trackClick } href={ shopUrl } disabled={ ! shopUrl }>
					{ translate( 'View & test your store' ) }
				</Button>
			</DashboardWidget>
		);
	};

	render() {
		const { site } = this.props;
		return (
			<div className="dashboard__manage-no-orders">
				<QuerySettingsProducts siteId={ site && site.ID } />
				{ this.renderShareWidget() }
				<DashboardWidgetRow>
					{ this.renderStatsWidget() }
					{ this.renderViewAndTestWidget() }
				</DashboardWidgetRow>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const shopPageId = getProductsSettingValue( state, 'woocommerce_shop_page_id' );
	return {
		shopPageId,
	};
}

export default connect( mapStateToProps )( localize( ManageNoOrdersView ) );
