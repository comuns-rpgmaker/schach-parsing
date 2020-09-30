/**
 * @file expression.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Core defintion of the arithmetic expression parser.
 */

import { Parser } from 'parser/base';
import { TextParser, char, spaces, StringParserError } from 'parser/text';

import { Expression } from './model';
import { operation } from './operators';
import { numberExpression } from './numbers';
import { variableExpression } from './variables';

/**
 * @returns a parser that parses an arithmetic expression into a tree of
 *          operations/values.
 */
export const expression = Parser.of(
    (): TextParser<Expression, StringParserError> =>
    {
        const parensExpr = Parser.of(
            (): TextParser<Expression, StringParserError> =>
                char('(')
                    .dropThen(spaces())
                    .flatMap(() => expression())
                    .thenDrop(spaces())
                    .thenDrop(char(')')));

        const valueExpr =
            parensExpr()
            .or(numberExpression())
            .or(variableExpression());
        
        return operation(valueExpr).or(valueExpr);
    });
