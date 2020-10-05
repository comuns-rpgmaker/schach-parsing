/**
 * @file evaluate.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Evaluation function definition.
 */

import { Expression, OPERATORS } from 'parser/arithmetic';

import { $gameVariables } from 'rmmz';

/**
 * Builtin functions (basically the Math class).
 */
const builtinFunctions: Record<string, (...args: number[]) => number> = {
    'min': Math.min,
    'max': Math.max,
    'abs': Math.abs,
    'sign': Math.sign,
    'exp': Math.exp,
    'log': Math.log,
    'log10': Math.log10,
    'log2': Math.log2,
    'ceil': Math.ceil,
    'floor': Math.floor,
    'sqrt': Math.sqrt,
    'rand': Math.random,
    'hypot': Math.hypot,
    'sin': Math.sin,
    'sinh': Math.sinh,
    'asin': Math.asin,
    'cos': Math.cos,
    'cosh': Math.cosh,
    'acos': Math.acos,
    'tan': Math.tan,
    'tanh': Math.tanh,
    'atan': Math.atan,
    'avg': (...args) => args.reduce((a, b) => a + b) / args.length
};

/**
 * Type for options to be passed into the evaluate function.
 */
export type EvaluateOptions = {
    variables: Record<string, number>,
    functions: Record<string, (...args: number[]) => number>
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
    switch (expr.type)
    {
        case 'number':
            return expr.value;
        
        case 'game_variable':
            return $gameVariables.value(evaluate(expr.id, options));

        case 'free_variable':
            if (!options.variables || !(expr.name in options.variables))
            {
                throw new ReferenceError(
                    `Missing value for variable "${expr.name}"`);
            }
    
            return options.variables[expr.name];

        case 'function_call':
            let f: (...args: number[]) => number;
            if (!options.functions || !(expr.name in options.functions))
            {
                if (!(expr.name in builtinFunctions))
                {
                    throw new ReferenceError(
                        `Missing definition for function "${expr.name}"`);
                }

                f = builtinFunctions[expr.name];
            }
            else
            {
                f = options.functions[expr.name];
            }

            const args = expr.args.map(e => evaluate(e, options));
            return f(...args);
        
        case 'operator':
            return OPERATORS[expr.operator](
                evaluate(expr.left, options),
                evaluate(expr.right, options)
            );
    }
}
