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
import { expression } from './expression';
import { VariableExpression } from './model';

/**
 * @returns a parser that accepts a variable expression in the format
 *          `v[<expression>]` and returns a VariableExpression object.
 */
export const variableExpression = Parser.of(
    (): TextParser<VariableExpression, StringParserError> => 
        char('v')
        .dropThen(char('['))
        .flatMap(() =>
            expression().map<VariableExpression>(expr => ({
                type: 'variable',
                id: expr
            })))
        .thenDrop(char(']')));
