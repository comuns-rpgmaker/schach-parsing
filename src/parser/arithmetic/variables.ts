/**
 * @file variables.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Definitions for the variable expression parser.
 */

import { Parser } from 'parser/base';
import { alphanumeric, char, string, StringParserError, TextParser } from 'parser/text';
import { expression, FreeVariableExpression, GameVariableExpression } from 'parser/arithmetic';
import { many1 } from 'parser/combinators';

/**
 * @returns a parser that accepts a variable expression in the format
 *          `v[<expression>]` and returns a VariableExpression object.
 */
export const gameVariableExpression = Parser.of(
    (): TextParser<GameVariableExpression, StringParserError> => 
        char('v')
        .dropThen(char('['))
        .flatMap(() =>
            expression().map<GameVariableExpression>(expr => ({
                type: 'game_variable',
                id: expr
            })))
        .thenDrop(char(']')));

const name =
    many1(alphanumeric().or(char('_')))
    .map(chars => chars.join(''))
    .mapError(e => ({ actual: e.actual, expected: 'name' }));

export const freeVariableExpression = Parser.of(
    (): TextParser<FreeVariableExpression, StringParserError> => 
        char('#')
        .dropThen(name)
        .map<FreeVariableExpression>(name => ({
            type: 'free_variable',
            name
        })));
