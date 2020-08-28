/**
 * @file operators.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Parsers and definitions for arithmetic operators and operations.
 */

import { Parser } from '../base';
import { oneOf } from '../combinators';
import { string, spaces } from '../text';

import { Operator, OperatorExpression, Expression } from './types';

const build = (
    priority: number,
    f: (a: number, b: number) => number
): Operator =>
{
    const op = f as Operator;
    op.priority = priority;
    return op;
}

const OPERATORS: Record<string, Operator> = {
    '+': build(0, (a, b) => a + b),
    '-': build(0, (a, b) => a - b),
    '/': build(1, (a, b) => a / b),
    '*': build(1, (a, b) => a * b),
    '^': build(2, Math.pow)
};

const before = (left: Operator, right: Operator): boolean =>
    left.priority > right.priority;

type LeftOperatorExpression = Omit<OperatorExpression, "right">;
type OperatorOnlyExpression = Omit<LeftOperatorExpression, "left">;

const operator =
    oneOf(...Object.keys(OPERATORS).map(string))
    .map(op => OPERATORS[op])
    .error((_, context) =>
        `expected operator (${Object.keys(OPERATORS).join(', ')}), got '${context}'`)
    .map(f => ({ type: 'operator', operator: f }) as OperatorOnlyExpression);

const balanceOperators =
    (left: LeftOperatorExpression) =>
    (right: OperatorExpression): OperatorExpression =>
        before(left.operator, right.operator)
        ? { ...right, left: { ...left, right: right.left } }
        : { ...left, right };

/**
 * @param valueExpr - parser to be used for the operands.
 * @returns a parser for an operation or a sequence of operations.
 */
export const operation =
    (valueExpr: Parser<string, Expression>): Parser<string, OperatorExpression> =>
        valueExpr
        .thenDrop(spaces)
        .flatMap(left => operator.map(op => ({ ...op, left })))
        .thenDrop(spaces)
        .flatMap(op =>
            operation(valueExpr).map(balanceOperators(op))
            .or(valueExpr.map(right => ({ ...op, right }))));
