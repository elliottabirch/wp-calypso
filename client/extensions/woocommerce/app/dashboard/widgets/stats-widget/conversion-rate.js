/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { UNITS } from 'woocommerce/app/store-stats/constants';
import { getUnitPeriod, getProductConversionRateData } from 'woocommerce/app/store-stats/utils';

class Stat extends Component {
	// TODO
	static propTypes = {};

	render() {
		return <div>Conversion Rates</div>;
	}
}

export default connect( ( state, { site, unit } ) => {
	const visitorData = getSiteStatsNormalizedData( state, site.ID, 'statsVisits', {
		unit,
		date: moment().format( 'YYYY-MM-DD' ),
		quantity: UNITS[ unit ].quantity,
	} );

	const unitSelectedDate = getUnitPeriod( moment().format( 'YYYY-MM-DD' ), unit );
	const productQuery = {
		unit,
		date: unitSelectedDate,
		quantity: UNITS[ unit ].quantity,
	};

	const productData = getSiteStatsNormalizedData(
		state,
		site.ID,
		'statsStoreProductEvents',
		productQuery
	);

	const data = getProductConversionRateData( visitorData, productData, unit );
	//console.log( data );

	return {
		data,
	};
} )( Stat );
