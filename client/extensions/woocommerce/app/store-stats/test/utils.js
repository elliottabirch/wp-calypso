/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { UNITS } from '../constants';
import {
	calculateDelta,
	formatValue,
	getDelta,
	getEndPeriod,
	getStartPeriod,
	getQueryDate,
	getUnitPeriod,
} from '../utils';

describe( 'calculateDelta', () => {
	test( 'should return a correctly formed object', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.isObject( delta );
		assert.isString( delta.value );
		assert.isString( delta.since );
		assert.isArray( delta.classes );
	} );

	test( 'should return correct values', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50, labelDay: 'a fortnight' };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.equal( delta.value, '50%' );
		assert.equal( delta.since, 'since a fortnight' );
		assert.include( delta.classes, 'is-favorable' );
		assert.include( delta.classes, 'is-increase' );
	} );

	test( 'should return correct sign and direction', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.include( delta.classes, 'is-unfavorable' );
		assert.include( delta.classes, 'is-decrease' );
		assert.lengthOf( delta.classes, 2 );
	} );

	test( 'should return correct sign and direction for properties where less is good', () => {
		const item = { total_refund: 75 };
		const previousItem = { total_refund: 100 };
		const delta = calculateDelta( item, previousItem, 'total_refund', 'day' );
		assert.include( delta.classes, 'is-favorable' );
		assert.include( delta.classes, 'is-decrease' );
		assert.lengthOf( delta.classes, 2 );
	} );

	test( 'should return correct sign and direction for value of 0', () => {
		const item = { doodads: 100 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.include( delta.classes, 'is-neutral' );
		assert.lengthOf( delta.classes, 1 );
	} );
} );

describe( 'getQueryDate', () => {
	test( 'should return a string', () => {
		const context = {
			params: { unit: 'day' },
			query: { startDate: '2017-06-12' },
		};
		const queryDate = getQueryDate( context );
		assert.isString( queryDate );
	} );

	test( 'should return a value for today given an undefined startDate queryParameter', () => {
		const context = {
			params: { unit: 'day' },
			query: { startDate: undefined },
		};
		const today = moment().format( 'YYYY-MM-DD' );
		const queryDate = getQueryDate( context );
		assert.strictEqual( queryDate, today );
	} );

	test( 'should return a value for today given a startDate of less than the quantity', () => {
		const quantity = UNITS.day.quantity;
		const startDate = moment()
			.subtract( Math.floor( quantity / 2 ), 'days' )
			.format( 'YYYY-MM-DD' );
		const context = {
			params: { unit: 'day' },
			query: { startDate },
		};
		const queryDate = getQueryDate( context );
		const today = moment().format( 'YYYY-MM-DD' );
		assert.strictEqual( queryDate, today );
	} );

	test( 'should return a value going back only in multiples of the specified quantity', () => {
		const quantity = UNITS.day.quantity;
		const daysBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment()
			.subtract( daysBack, 'days' )
			.format( 'YYYY-MM-DD' );
		const context = {
			params: { unit: 'day' },
			query: { startDate },
		};
		const queryDate = getQueryDate( context );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'days' )
			.format( 'YYYY-MM-DD' );
		assert.strictEqual( queryDate, todayShouldBe );
	} );

	test( 'should work in weeks as well', () => {
		const quantity = UNITS.week.quantity;
		const weeksBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment()
			.subtract( weeksBack, 'weeks' )
			.format( 'YYYY-MM-DD' );
		const context = {
			params: { unit: 'week' },
			query: { startDate },
		};
		const queryDate = getQueryDate( context );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'weeks' )
			.format( 'YYYY-MM-DD' );
		assert.strictEqual( queryDate, todayShouldBe );
	} );
} );

describe( 'getUnitPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'week' );
		assert.isString( queryDate );
	} );
	test( 'should return an isoWeek format for a week unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'week' );
		assert.strictEqual( queryDate, '2017-W27' );
	} );
	test( 'should return a well formatted period for a month unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'month' );
		assert.strictEqual( queryDate, '2017-07' );
	} );
	test( 'should return a well formatted period for a year unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'year' );
		assert.strictEqual( queryDate, '2017' );
	} );
	test( 'should return a well formatted period for a day unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'day' );
		assert.strictEqual( queryDate, '2017-07-05' );
	} );
} );

describe( 'getEndPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'week' );
		assert.isString( queryDate );
	} );
	test( 'should return an the date for the end of the week', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'week' );
		assert.strictEqual( queryDate, '2017-07-09' );
	} );
	test( 'should return an the date for the end of the month', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'month' );
		assert.strictEqual( queryDate, '2017-07-31' );
	} );
	test( 'should return an the date for the end of the year', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'year' );
		assert.strictEqual( queryDate, '2017-12-31' );
	} );
	test( 'should return an the date for the end of the day', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'day' );
		assert.strictEqual( queryDate, '2017-07-05' );
	} );
} );

describe( 'getStartPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'week' );
		assert.isString( queryDate );
	} );
	test( 'should return an the date for the first of the week', () => {
		const queryDate = getStartPeriod( '2017-07-09', 'week' );
		assert.strictEqual( queryDate, '2017-07-03' );
	} );
	test( 'should return an the date for the first of the month', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'month' );
		assert.strictEqual( queryDate, '2017-07-01' );
	} );
	test( 'should return an the date for the start of the year', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'year' );
		assert.strictEqual( queryDate, '2017-01-01' );
	} );
	test( 'should return an the date for the start of the day', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'day' );
		assert.strictEqual( queryDate, '2017-07-05' );
	} );
} );

describe( 'formatValue', () => {
	test( 'should return a correctly formatted currency for NZD', () => {
		const response = formatValue( 12.34, 'currency', 'NZD' );
		assert.isString( response );
		assert.strictEqual( response, 'NZ$12.34' );
	} );
	test( 'should return a correctly formatted currency for USD', () => {
		const response = formatValue( 12.34, 'currency', 'USD' );
		assert.isString( response );
		assert.strictEqual( response, '$12.34' );
	} );
	test( 'should return a correctly formatted currency for ZAR', () => {
		const response = formatValue( 12.34, 'currency', 'ZAR' );
		assert.isString( response );
		assert.strictEqual( response, 'R12,34' );
	} );
	test( 'should return a correctly formatted USD currency for unknown code', () => {
		const response = formatValue( 12.34, 'currency', 'XXX' );
		assert.isString( response );
		assert.strictEqual( response, '$12.34' );
	} );
	test( 'should return a correctly formatted USD currency for missing code', () => {
		const response = formatValue( 12.34, 'currency' );
		assert.isString( response );
		assert.strictEqual( response, '$12.34' );
	} );
	test( 'should return a correctly formatted number to 2 decimals', () => {
		const response = formatValue( 12.3456, 'number' );
		assert.isNumber( response );
		assert.strictEqual( response, 12.35 );
	} );
	test( 'should return a correctly formatted string', () => {
		const response = formatValue( 'string', 'text' );
		assert.isString( response );
		assert.strictEqual( response, 'string' );
	} );
} );

const deltas = [
	{
		period: '2017-07-07',
		right: {
			right: true,
			period: '2017-07-06',
		},
		wrong: {
			right: false,
			period: '2017-07-06',
		},
	},
	{
		period: '2017-07-06',
		right: {
			right: true,
			period: '2017-07-06',
		},
		wrong: {
			right: false,
			period: '2017-07-06',
		},
	},
];
describe( 'getDelta', () => {
	test( 'should return an Object', () => {
		const delta = getDelta( deltas, '2017-07-06', 'right' );
		assert.isObject( delta );
	} );
	test( 'should return the correct delta', () => {
		const delta = getDelta( deltas, '2017-07-06', 'right' );
		assert.strictEqual( delta.right, true );
		assert.strictEqual( delta.period, '2017-07-06' );
	} );
} );
