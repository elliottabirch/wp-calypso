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
	getDelta,
	getEndPeriod,
} from 'woocommerce/app/store-stats/utils';
import Sparkline from 'woocommerce/components/d3/sparkline';
import { UNITS } from 'woocommerce/app/store-stats/constants';

class Stat extends Component {
	// TODO
	static propTypes = {};

	renderDelta = delta => {
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

	renderSparkLine = index => {
		const { data, attribute } = this.props;
		const timeSeries = data.map( row => +row[ attribute ] );
		return (
			<Sparkline aspectRatio={ 3 } data={ timeSeries } highlightIndex={ index } maxHeight={ 50 } />
		);
	};

	render() {
		const { label, unit, site, attribute, type, data, deltas } = this.props;

		const selectedDate = getEndPeriod( moment().format( 'YYYY-MM-DD' ), unit );

		if ( ! data.length || ! site.ID ) {
			return null;
		}

		const index = findIndex( data, d => d.period === selectedDate );
		if ( ! data[ index ] ) {
			return null;
		}

		const value = data[ index ][ attribute ];
		const delta = getDelta( deltas, selectedDate, attribute );

		return (
			<div className="stats-widget__box-contents">
				<p>{ label }</p>
				<span>
					{ type === 'currency'
						? formatCurrency( value, data[ index ].currency )
						: Math.round( value * 100 ) / 100 }
				</span>
				{ this.renderDelta( delta ) }
				{ this.renderSparkLine( index ) }
			</div>
		);
	}
}

export default connect( ( state, { site, stat, unit } ) => {
	const unitQueryDate = getUnitPeriod(
		getStartDate( moment().format( 'YYYY-MM-DD' ), unit ),
		unit
	);
	const statsData = getSiteStatsNormalizedData( state, site.ID, stat, {
		unit,
		date: unitQueryDate,
		quantity: UNITS[ unit ].quantity,
	} );

	return {
		data: statsData.data,
		deltas: statsData.deltas || {},
	};
} )( Stat );
