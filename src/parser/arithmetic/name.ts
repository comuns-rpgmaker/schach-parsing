/**
 * @file name.ts
 * 
 * @author Brandt
 * @date 2020/10/04
 * @license Zlib
 * 
 * Definition for the variable/function name parser.
 */

import { Parser } from "parser/base";
import { many1 } from "parser/combinators";

import { alphanumeric, char } from "parser/text";

/**
 * @returns a parser that accepts a valid alphanumeric (plus _) name for
 *          a variable/function.
 */
export const name = Parser.of(() =>
    many1(alphanumeric().or(char('_')))
    .map(chars => chars.join(''))
    .mapError(e => ({ actual: e.actual, expected: 'name' })));
