/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { moment, localize } from 'i18n-calypso';
import { findIndex, round } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { UNITS } from 'woocommerce/app/store-stats/constants';
import {
	getUnitPeriod,
	getProductConversionRateData,
	getDeltaFromData,
} from 'woocommerce/app/store-stats/utils';
import Delta from 'woocommerce/components/delta';
import Sparkline from 'woocommerce/components/d3/sparkline';

class Stat extends Component {
	// TODO
	static propTypes = {};

	renderDelta = delta => {
		return <Delta value={ delta.value } className={ delta.classes.join( ' ' ) } />;
	};

	renderSparkLine = index => {
		const { data, attribute } = this.props;
		const timeSeries = data.map( row => +row[ attribute ] );
		return (
			<Sparkline aspectRatio={ 3 } data={ timeSeries } highlightIndex={ index } maxHeight={ 50 } />
		);
	};

	render() {
		const { translate, unit, site, attribute, data } = this.props;

		const selectedDate = getUnitPeriod( moment().format( 'YYYY-MM-DD' ), unit );

		if ( ! data.length || ! site.ID ) {
			return null;
		}
		const index = findIndex( data, d => d.period === selectedDate );
		if ( ! data[ index ] ) {
			return null;
		}

		const value = data[ index ][ attribute ];

		const delta = getDeltaFromData( data, selectedDate, attribute, unit );

		return (
			<div className="stats-widget__box-contents">
				<p>{ translate( 'Conversion Rates' ) }</p>
				<span>{ round( value, 2 ) }%</span>
				{ this.renderDelta( delta ) }
				{ this.renderSparkLine( index ) }
			</div>
		);
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
	return {
		data,
	};
} )( localize( Stat ) );
