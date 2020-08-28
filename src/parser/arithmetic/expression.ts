/**
 * @file expression.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Core defintion of the arithmetic expression parser.
 */

import { Parser } from '../base';

import { char, spaces } from '../text';

import { Expression } from './types';
import { operation } from './operators';
import { numberExpression as number } from './numbers';

const parensExpr = (): Parser<string, Expression> =>
    char('(')
        .dropThen(spaces)
        .dropThen(expression)
        .thenDrop(spaces)
        .thenDrop(char(')'));

/**
 * @returns a parser that parses an arithmetic expression into a tree of
 *          operations/values.
 */
export function expression(): Parser<string, Expression>
{
    const valueExpr = parensExpr().or(number());
    return operation(valueExpr).or(valueExpr);
}
