/**
 * @file numbers.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Definitions for numeric parsers.
 */

import { Parser, pure } from '../base';
import { many1 } from '../combinators';

import { char, digit, spaces, TextParser } from '../text';

import type { NumberExpression } from './model';

/**
 * @returns a parser that accepts a (possibly signed) string of digits and
 *          returns an int.
 */
export const integer = Parser.of((): TextParser<number> =>
    many1(digit())
        .map(digits => digits.reduce((acc, n) => acc * 10 + n)));

const sign =
    char('-').thenDrop(spaces()).dropThen(pure(-1))
    .or(char('+').dropThen(pure(1)))
    .or(pure(1));

const floatingPoint = 
    char('.')
    .dropThen(many1(digit()))
    .map(digits => digits.reduceRight((acc, n) => n + acc / 10) / 10);

const exponent =
    char('e')
    .dropThen(sign.flatMap(bit => integer().map(n => bit * n)))
    .map(e => Math.pow(10, e))
    .or(pure(1));

/**
 * @returns a parser that accepts a string of digits and/or a floating point
 *          expression and returns a number.
 */
export const number = Parser.of((): TextParser<number> =>
    sign.flatMap(bit =>
        integer()
        .flatMap(n => floatingPoint.map(f => bit * (n + f)).or(pure(n)))
        .or(floatingPoint)
        .flatMap(n => exponent.map(e => n * e))));

/**
 * @returns a parser that accepts a string of digits and/or a floating point
 *          expression and returns a number expression.
 */
export const numberExpression = Parser.of((): TextParser<NumberExpression> =>
    number().map(value => ({ type: 'number', value })));