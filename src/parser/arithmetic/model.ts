/**
 * @file types.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Type definitions for arithmetic expressions.
 */

/**
 * Type for a binary operator with priority.
 */
export type Operator =
    ((a: number, b: number) => number) & { priority: number };

const operator = (
    priority: number,
    f: (a: number, b: number) => number
): Operator =>
{
    const op = f as Operator;
    op.priority = priority;
    return op;
}

/**
 * Map of available operators.
 */
export const OPERATORS = {
    '+': operator(0, (a, b) => a + b),
    '-': operator(0, (a, b) => a - b),
    '/': operator(1, (a, b) => a / b),
    '*': operator(1, (a, b) => a * b),
    '^': operator(2, Math.pow)
};

/**
 * Type for an expression with a simple number.
 */
export type NumberExpression = {
    type: 'number',
    value: number
};

/**
 * Type for a variable expression.
 */
export type GameVariableExpression = {
    type: 'game_variable',
    id: Expression
};

/**
 * Type for a free variable expression.
 */
export type FreeVariableExpression = {
    type: 'free_variable',
    name: string
};

/**
 * Type for a function call expression.
 */
export type FunctionCallExpression = {
    type: 'function_call',
    name: string,
    args: Expression[]
};

/**
 * Generic type for value expressions.
 */
type ValueExpression = NumberExpression | GameVariableExpression
                        | FreeVariableExpression | FunctionCallExpression;

/**
 * Type for an operator expression.
 */
export type OperatorExpression = {
    type: 'operator',
    operator: keyof typeof OPERATORS,
    left: Expression,
    right: Expression
};

/**
 * Type for an arithmetic expression tree.
 */
export type Expression = ValueExpression | OperatorExpression;
