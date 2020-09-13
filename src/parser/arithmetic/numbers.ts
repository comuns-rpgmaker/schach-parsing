/**
 * @file numbers.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Definitions for numeric parsers.
 */

import { Parser, pure } from 'parser/base';
import { many1 } from 'parser/combinators';

import { char, digit, spaces, TextParser, CharParserError } from '../text';

import type { NumberExpression } from './model';

/**
 * @returns a parser that accepts a (possibly signed) string of digits and
 *          returns an int.
 */
export const integer = Parser.of((): TextParser<number, CharParserError> =>
    many1(digit()).map(digits => digits.reduce((acc, n) => acc * 10 + n)));

const sign =
    char('-').thenDrop(spaces()).dropThen(pure(-1))
    .or(char('+').dropThen(pure(1)));

const floatingPoint =
    char('.')
    .dropThen(many1(digit()))
    .map(digits => digits.reduceRight((acc, n) => n + acc / 10) / 10);

const exponent =
    char('e')
    .dropThen(sign.or(pure(1)).zip(integer()))
    .map(([signBit, n])=> signBit * n)
    .map(e => Math.pow(10, e));

/**
 * @returns a parser that accepts a string of digits and/or a floating point
 *          expression and returns an unsigned number.
 */
export const unsigned = Parser.of((): TextParser<number, CharParserError> =>
    integer().zip(floatingPoint.or(pure(0))).map(([n, f]) => n + f)
    .or(floatingPoint)
    .zip(exponent.or(pure(1)))
    .map(([n, e]) => n * e)
    .mapError(({ actual }) => ({ expected: 'unsigned', actual }))); 

/**
 * @returns a parser that accepts a string and returns a signed number.
 */
export const number = Parser.of((): TextParser<number, CharParserError> =>
    sign.or(pure(1)).zip(unsigned())
    .map(([bit, n]) => bit * n)
    .mapError(({ actual }) => ({ expected: 'number', actual })));

/**
 * @returns a parser that accepts a string of digits and/or a floating point
 *          expression and returns a number expression.
 */
export const numberExpression = Parser.of(
    (): TextParser<NumberExpression, CharParserError> =>
        number().map(value => ({ type: 'number', value })));
