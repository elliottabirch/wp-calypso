/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { findIndex } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Delta from 'woocommerce/components/delta';
import formatCurrency from 'lib/format-currency';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import {
	getUnitPeriod,
	getStartDate,
	getStartPeriod,
	getDelta,
	getDeltaFromData,
	getEndPeriod,
} from 'woocommerce/app/store-stats/utils';
import Sparkline from 'woocommerce/components/d3/sparkline';
import { UNITS } from 'woocommerce/app/store-stats/constants';

class Stat extends Component {
	// TODO
	static propTypes = {};

	// Todo better name..
	renderDeltaFromAPI = delta => {
		const deltaValue =
			delta.direction === 'is-undefined-increase'
				? '-'
				: Math.abs( Math.round( delta.percentage_change * 100 ) );

		return (
			<Delta
				value={ `${ deltaValue }%` }
				className={ `${ delta.favorable } ${ delta.direction }` }
			/>
		);
	};

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
		const { label, unit, site, attribute, type, data, deltas, stat } = this.props;

		const selectedDate =
			'statsVisits' === stat
				? getStartPeriod( moment().format( 'YYYY-MM-DD' ), unit )
				: getEndPeriod( moment().format( 'YYYY-MM-DD' ), unit );

		if ( ! data.length || ! site.ID ) {
			return null;
		}
		const index = findIndex( data, d => d.period === selectedDate );
		if ( ! data[ index ] ) {
			return null;
		}

		const value = data[ index ][ attribute ];
		const delta =
			'statsVisits' === stat
				? getDeltaFromData( data, selectedDate, attribute, unit )
				: getDelta( deltas, selectedDate, attribute );

		return (
			<div className="stats-widget__box-contents">
				<p>{ label }</p>
				<span>
					{ type === 'currency'
						? formatCurrency( value, data[ index ].currency )
						: Math.round( value * 100 ) / 100 }
				</span>
				{ 'statsVisits' !== stat ? this.renderDeltaFromAPI( delta ) : this.renderDelta( delta ) }
				{ this.renderSparkLine( index ) }
			</div>
		);
	}
}

export default connect( ( state, { site, stat, unit } ) => {
	const unitQueryDate =
		'statsVisits' === stat
			? moment().format( 'YYYY-MM-DD' )
			: getUnitPeriod( getStartDate( moment().format( 'YYYY-MM-DD' ), unit ), unit );

	const statsData = getSiteStatsNormalizedData( state, site.ID, stat, {
		unit,
		date: unitQueryDate,
		quantity: UNITS[ unit ].quantity,
	} );

	const data = 'statsVisits' === stat ? statsData || [] : statsData && statsData.data;
	return {
		data,
		deltas: statsData.deltas || {},
	};
} )( Stat );
