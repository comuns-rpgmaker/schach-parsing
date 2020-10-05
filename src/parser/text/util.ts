/**
 * @file base.ts
 * 
 * @author Brandt
 * @date 2020/09/07
 * @license Zlib
 * 
 * Utilitary text parsers.   
 */

import { Parser, pure } from 'parser/base';

import { char, CharParserError } from './char'; 
import { TextParser, TextParsing } from './base';
import { TextContext } from './context';

const CP_ZERO = 48;
const CP_NINE = 57;

/**
 * Specialized parser that accepts a single arabic digit.
 */
class DigitParser extends TextParser<number, CharParserError>
{
    runT(input: string, context: TextContext): TextParsing<number, CharParserError>
    {
        const codePoint = input.codePointAt(context.offset.index);

        if (codePoint && CP_ZERO <= codePoint && codePoint <= CP_NINE)
        {
            return {
                rest: input,
                context: context.withOffset({ index: 1, column: 1 }),
                result: {
                    success: true,
                    parsed: this.codePointToInt(codePoint),
                }
            };
        }
        else
        {
            const actual = typeof codePoint === 'undefined'
                            ? '<eos>'
                            : String.fromCodePoint(codePoint);

            return {
                rest: input,
                context,
                result: {
                    success: false,
                    error: {
                        expected: '0-9',
                        actual
                    }
                }
            };
        }
    }

    private codePointToInt(codePoint: number): number
    {
        return codePoint - CP_ZERO;
    }
}

/**
 * Specialized parser that accepts a single character that matches a condition.
 */
class PredicateParser extends TextParser<number, CharParserError>
{
    private readonly _predicate: (c: number) => boolean;
    private readonly _expected: string;

    constructor(predicate: (c: number) => boolean, expected: string)
    {
        super();
        this._predicate = predicate;
        this._expected = expected;
    }

    runT(input: string, context: TextContext): TextParsing<number, CharParserError>
    {
        const codePoint = input.codePointAt(context.offset.index);

        if (codePoint && this._predicate(codePoint))
        {
            return {
                rest: input,
                context: context.withOffset({ index: 1, column: 1 }),
                result: {
                    success: true,
                    parsed: codePoint
                }
            };
        }
        else
        {
            const actual = typeof codePoint === 'undefined'
                            ? '<eos>'
                            : String.fromCodePoint(codePoint);

            return {
                rest: input,
                context,
                result: {
                    success: false,
                    error: {
                        expected: this._expected,
                        actual
                    }
                }
            };
        }
    }
}

/**
 * Specialized parser that matches the end of the string.
 */
class EOSParser extends TextParser<undefined, CharParserError>
{
    runT(input: string, context: TextContext): TextParsing<undefined, CharParserError>
    {
        if (context.offset.index >= input.length)
        {
            return {
                rest: input,
                context: context,
                result: {
                    success: true,
                    parsed: undefined
                }
            };
        }
        else
        {
            return {
                rest: input,
                context,
                result: {
                    success: false,
                    error: {
                        expected: 'end of string',
                        actual: input[context.offset.index]
                    }
                }
            };
        }
    }
}

/**
 * @returns a parser for a single arabic digit (0-9).
 */
export const digit = Parser.of(() => new DigitParser());

/**
 * @returns a parser for a single letter (a-z, A-Z).
 */
export const letter = Parser.of(() => new PredicateParser(
    (c: number) => (65 <= c && c <= 90) || (97 <= c && c <= 122),
    "A-Z/a-z")
    .map(c => String.fromCodePoint(c)));

/**
 * @param predicate - condition to match.
 * @param name - name of the condition to be used on error messages.
 * 
 * @returns a parser for a characer that matches the given condition.
 */
export const predicate = (p: (c: number) => boolean, name: string) =>
    new PredicateParser(p, name);

/**
 * @returns a parser for a single arabic digit (0-9).
 */
export const alphanumeric = Parser.of(() =>
    letter()
    .or(digit().map(n => n.toString()))
    .mapError(({ actual }) => ({ actual, expected: 'A-z, 0-9' })));

/**
 * @returns a parser that matches any number of spaces.
 */
export const spaces = Parser.of((): TextParser<string, never> =>
    char(' ')
    .flatMap(s => spaces().map(t => s + t))
    .or(pure('')));

/**
 * @returns a parser that matches the end of the string.
 */
export const eos = Parser.of(() => new EOSParser());
