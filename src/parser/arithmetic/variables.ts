/**
 * @file variables.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Definitions for the variable expression parsers.
 */

import { Parser } from 'parser/base';
import { char, StringParserError, TextParser } from 'parser/text';

import {
    expression,
    FreeVariableExpression,
    GameVariableExpression
} from 'parser/arithmetic';

import { name } from 'parser/arithmetic/name';

/**
 * @returns a parser that accepts a variable expression in the format
 *          `v[<expression>]` and returns a GameVariableExpression object.
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

/**
 * @returns a parser that accepts a free variables expression in the format
 *          `#<name>` and returns a FreeVariableExpression object.
 */
export const freeVariableExpression = Parser.of(
    (): TextParser<FreeVariableExpression, StringParserError> => 
        char('#')
        .dropThen(name())
        .map<FreeVariableExpression>(name => ({
            type: 'free_variable',
            name
        })));
