/**
 * External dependencies
 *
 * @format
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { moment, localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import { getUnitPeriod } from 'woocommerce/app/store-stats/utils';
import { dashboardListLimit } from 'woocommerce/app/store-stats/constants';
import Module from 'woocommerce/app/store-stats/store-stats-module';
import List from 'woocommerce/app/store-stats/store-stats-list';

class StatsWidgetList extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			id: PropTypes.number,
			slug: PropTypes.string,
		} ),
		unit: PropTypes.string.isRequired,
		values: PropTypes.array.isRequired,
		statSlug: PropTypes.string.isRequired,
		statType: PropTypes.string.isRequired,
		emptyMessage: PropTypes.string.isRequired,
	};

	render = () => {
		const { site, translate, unit, values, statSlug, statType, emptyMessage } = this.props;

		const unitSelectedDate = getUnitPeriod( moment().format( 'YYYY-MM-DD' ), unit );
		const query = {
			unit,
			date: unitSelectedDate,
		};

		if ( 'statsStoreReferrers' === statType ) {
			query.quantity = 1;
		} else {
			query.limit = dashboardListLimit;
		}

		const moreLink = (
			<div className="stats-widget__more">
				<a href={ getLink( `/store/stats/${ statSlug }/${ unit }/:site`, site ) }>
					{ translate( 'More' ) }
				</a>
			</div>
		);

		return (
			<div className="stats-widget__box-contents">
				<Module
					siteId={ site.ID }
					emptyMessage={ emptyMessage }
					moreLink={ moreLink }
					query={ query }
					statType={ statType }
				>
					<List
						siteId={ site.ID }
						values={ values }
						query={ query }
						statType={ statType }
						limit={ dashboardListLimit }
					/>
				</Module>
			</div>
		);
	};
}

export default localize( StatsWidgetList );
