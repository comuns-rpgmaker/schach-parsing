/**
 * @file evaluate.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Evaluation function definition.
 */

import { Expression } from 'parser/arithmetic';

import { $gameVariables } from 'rmmz';

/**
 * Evaluates a parsed tree of operations/values.
 * 
 * @param expr - parsed expression.
 * @param variables - assigned values for free variables on the expression.
 * 
 * @returns the result of the given expression.
 */
export function evaluate(
    expr: Expression,
    variables?: Record<string, number>
): number
{
    if (expr.type === 'number')
    {
        return expr.value;
    }
    else if (expr.type === 'game_variable')
    {
        return $gameVariables.value(evaluate(expr.id, variables));
    }
    else if (expr.type === 'free_variable')
    {
        if (!variables || !(expr.name in variables))
        {
            throw new ReferenceError(
                `Missing value for variable "${expr.name}"`);
        }

        return variables[expr.name];
    }
    else
    {
        return expr.operator(
            evaluate(expr.left, variables),
            evaluate(expr.right, variables)
        );
    }
}
