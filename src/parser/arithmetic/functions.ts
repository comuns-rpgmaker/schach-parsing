/**
 * @file functions.ts
 * 
 * @author Brandt
 * @date 2020/10/03
 * @license Zlib
 * 
 * Definitions for the variable expression parser.
 */

import { Parser, pure } from "parser/base";
import { Expression, FunctionCallExpression, name } from "parser/arithmetic";
import { char, spaces, StringParserError, TextParser } from "parser/text";
import { many } from "parser/combinators";
import { expression } from "./expression";

const argumentList: TextParser<Expression[], StringParserError> =
    char('(')
    .flatMap(() =>
        expression()
        .zip(
            many(char(',')
            .dropThen(spaces())
            .dropThen(expression())))
        .map(([first, rest]) => [first, ...rest])
    )
    .or(pure([]))
    .thenDrop(char(')'));

export const functionCall = Parser.of(
    (): TextParser<FunctionCallExpression, StringParserError> =>
        name()
        .zip(argumentList)
        .map(([name, args]) => ({
            type: 'function_call',
            name,
            args
        })));
