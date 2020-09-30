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
import { char, StringParserError, TextParser } from 'parser/text';
import { expression, GameVariableExpression } from 'parser/arithmetic';

/**
 * @returns a parser that accepts a variable expression in the format
 *          `v[<expression>]` and returns a VariableExpression object.
 */
export const variableExpression = Parser.of(
    (): TextParser<GameVariableExpression, StringParserError> => 
        char('v')
        .dropThen(char('['))
        .flatMap(() =>
            expression().map<GameVariableExpression>(expr => ({
                type: 'game_variable',
                id: expr
            })))
        .thenDrop(char(']')));
