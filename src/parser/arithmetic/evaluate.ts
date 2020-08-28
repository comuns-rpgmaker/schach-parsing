/**
 * @file evaluate.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Evaluation function definition.
 */

import { Expression } from './types';

/**
 * Evaluates a parsed tree of operations/values.
 * 
 * @returns the result of the given expression.
 */
export function evaluate(expr: Expression): number
{
    if (expr.type === 'number') return expr.value;
    else return expr.operator(evaluate(expr.left), evaluate(expr.right));
}
