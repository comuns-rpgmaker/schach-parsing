/**
 * @file operators.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Parsers and definitions for arithmetic operators and operations.
 */

import { Parser } from 'parser/base';
import { oneOf } from 'parser/combinators';

import {
    string,
    spaces,
    TextParser,
    StringParserError
} from 'parser/text';

import { OPERATORS, OperatorExpression, Expression } from './model';

const before = (left: string, right: string): boolean =>
    OPERATORS[left].priority >= OPERATORS[right].priority;

type LeftOperatorExpression = Omit<OperatorExpression, "right">;
type OperatorOnlyExpression = Omit<LeftOperatorExpression, "left">;

const operator: TextParser<OperatorOnlyExpression, StringParserError> =
    oneOf(...Object.keys(OPERATORS).map(string))
    .mapError(() => ({ expected: `one of ${Object.keys(OPERATORS).join(', ')}` }))
    .map(op => ({ type: 'operator', operator: op }) as OperatorOnlyExpression)

const balanceOperators =
    (left: LeftOperatorExpression) =>
    (right: OperatorExpression): OperatorExpression =>
        before(left.operator, right.operator)
        ?
        {
            ...right,
            left: right.left.type === 'operator'
                ? balanceOperators(left)(right.left)
                : { ...left, right: right.left }
        }
        : { ...left, right };

/**
 * @param valueExpr - parser to be used for the operands.
 * @returns a parser for an operation or a sequence of operations.
 */
export const operation = (valueExpr: TextParser<Expression, StringParserError>):
    TextParser<OperatorExpression, StringParserError> => 
    {
        const self = Parser.of(():
            TextParser<OperatorExpression, StringParserError> =>
                valueExpr.thenDrop(spaces())
                .zip(operator)
                .map(([left, op]) => ({ ...op, left }))
                .thenDrop(spaces())
                .flatMap(op =>
                    self()
                    .map(balanceOperators(op))
                    .or(valueExpr.map(right => ({ ...op, right })))));

        return self();
    }
