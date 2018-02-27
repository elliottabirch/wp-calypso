/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import { formatValue, sortAndTrimEventData } from '../utils';

const StoreStatsList = ( { data, values, statType } ) => {
	const titles = (
		<TableRow isHeader>
			{ values.map( ( value, i ) => {
				return (
					<TableItem isHeader key={ i } isTitle={ 0 === i }>
						{ value.title }
					</TableItem>
				);
			} ) }
		</TableRow>
	);

	const renderEventList = entry => {
		return entry.data.map( ( row, i ) => (
			<TableRow key={ i }>
				{ values.map( ( value, j ) => (
					<TableItem key={ value.key } isTitle={ 0 === j }>
						{ formatValue( row[ value.key ], value.format, row.currency ) }
					</TableItem>
				) ) }
			</TableRow>
		) );
	};

	return (
		<Table header={ titles } compact>
			{ data.map(
				( row, i ) =>
					( 'statsStoreReferrers' === statType && renderEventList( row ) ) || (
						<TableRow key={ i }>
							{ values.map( ( value, j ) => (
								<TableItem key={ value.key } isTitle={ 0 === j }>
									{ formatValue( row[ value.key ], value.format, row.currency ) }
								</TableItem>
							) ) }
						</TableRow>
					)
			) }
		</Table>
	);
};

StoreStatsList.propTypes = {
	data: PropTypes.array.isRequired,
	values: PropTypes.array.isRequired,
	limit: PropTypes.number,
};

export default connect( ( state, { siteId, statType, query, limit } ) => {
	const normalizedData = getSiteStatsNormalizedData( state, siteId, statType, query );
	const data =
		'statsStoreReferrers' === statType
			? sortAndTrimEventData( normalizedData, limit )
			: normalizedData;
	return {
		data,
	};
} )( StoreStatsList );
