import { Parser, pure, oneOf, many1 } from './parser';
import { char, digit, string, spaces } from './text';

type Operator = ((a: number, b: number) => number) & { priority: number };

const Operator = (
    priority: number,
    f: (a: number, b: number) => number
): Operator =>
{
    const op = f as Operator;
    op.priority = priority;
    return op;
}

const OPERATORS: Record<string, Operator> = {
    '+': Operator(0, (a, b) => a + b),
    '-': Operator(0, (a, b) => a - b),
    '/': Operator(1, (a, b) => a / b),
    '*': Operator(1, (a, b) => a * b),
    '^': Operator(2, Math.pow)
};

const before = (a: Operator, b: Operator): boolean => a.priority >= b.priority;

/**
 * Type for an expression with a simple number.
 */
export type NumExpr = {
    type: 'number',
    value: number
};

/**
 * Type for an operator expression.
 */
export type OperatorExpr = {
    type: 'op',
    operator: Operator,
    left: Expr,
    right: Expr
};

/**
 * Type for an arithmetic expression tree.
 */
export type Expr = NumExpr | OperatorExpr;

/**
 * @returns a parser that accepts a string of digits and returns an int.
 */
export function integer(): Parser<string, number>
{
    return many1(digit())
        .map(digits => digits.reduce((acc, n) => acc * 10 + n));
}

const floatingPoint = 
    char('.')
    .flatMap(() => many1(digit()))
    .map(digits => digits.reduceRight((acc, n) => n + acc / 10) / 10);

/**
 * @returns a parser that accepts a string of digits and/or a floating point
 *          expression and returns a number.
 */
export function number(): Parser<string, number>
{
    return integer()
        .flatMap(n => floatingPoint.map(f => n + f).or(pure(n)))
        .or(floatingPoint)
        .error((_, context) => `expected number, got '${context}'`);
}

const operator =
    oneOf(...Object.keys(OPERATORS).map(string))
    .map(op => OPERATORS[op])
    .error((_, context) =>
        `expected operator (${Object.keys(OPERATORS).join(', ')}), got '${context}'`);

const numExpr: Parser<string, NumExpr> =
    number().map(value => ({ type: 'number', value }));

type LeftOperatorExpr = Omit<OperatorExpr, "right">;

const balanceOperators =
    (left: LeftOperatorExpr) =>
    (right: OperatorExpr): OperatorExpr =>
        before(right.operator, left.operator)
        ? { ...left, right }
        : { ...right, left: { ...left, right: right.left } };

const operatorExpr = (): Parser<string, OperatorExpr> =>
    numExpr.or(parensExpr)
        .thenDrop(spaces)
        .flatMap(left =>
            operator.map(operator =>
                ({ type: 'op', operator, left }) as LeftOperatorExpr
            )
        )
        .thenDrop(spaces)
        .flatMap(expr =>
            operatorExpr().map(balanceOperators(expr))
            .or(
                numExpr.or(parensExpr())
                .map(right => ({ ...expr, right }))));

const parensExpr = (): Parser<string, Expr> =>
    char('(')
        .dropThen(spaces)
        .dropThen(expression)
        .thenDrop(spaces)
        .thenDrop(char(')'));

/**
 * @returns a parser that parses an arithmetic expression into a tree of
 *          operations/values.
 */
export function expression(): Parser<string, Expr>
{
    return operatorExpr().or(parensExpr).or(numExpr);
}

/**
 * Evaluates a parsed tree of operations/values.
 * 
 * @returns the result of the given expression.
 */
export function evaluate(expr: Expr): number
{
    if (expr.type === 'number') return expr.value;
    else return expr.operator(evaluate(expr.left), evaluate(expr.right));
}
