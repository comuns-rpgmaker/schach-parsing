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
 * Type for options to be passed into the evaluate function.
 */
type EvaluateOptions = {
    variables: Record<string, number>
}

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
    options: Partial<EvaluateOptions>
): number
{
    if (expr.type === 'number')
    {
        return expr.value;
    }
    else if (expr.type === 'game_variable')
    {
        return $gameVariables.value(evaluate(expr.id, options));
    }
    else if (expr.type === 'free_variable')
    {
        if (!options.variables || !(expr.name in options.variables))
        {
            throw new ReferenceError(
                `Missing value for variable "${expr.name}"`);
        }

        return options.variables[expr.name];
    }
    else
    {
        return expr.operator(
            evaluate(expr.left, options),
            evaluate(expr.right, options)
        );
    }
}
