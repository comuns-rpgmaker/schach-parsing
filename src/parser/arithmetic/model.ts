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

/**
 * Type for an expression with a simple number.
 */
export type NumberExpression = {
    type: 'number',
    value: number
};

/**
 * Type for an operator expression.
 */
export type OperatorExpression = {
    type: 'operator',
    operator: Operator,
    left: Expression,
    right: Expression
};

/**
 * Type for an arithmetic expression tree.
 */
export type Expression = NumberExpression | OperatorExpression;