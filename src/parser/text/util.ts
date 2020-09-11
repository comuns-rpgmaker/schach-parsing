/**
 * @file base.ts
 * 
 * @author Brandt
 * @date 2020/09/07
 * @license Zlib
 * 
 * Utilitary text parsers.   
 */

import { Parser, pure } from '../base';
import { ParseResult } from '../result';

import { char, CharParserError } from './char'; 
import { TextParser } from './base';
import { TextContext } from './context';

type ResultWithContext = {
    result: ParseResult<number, CharParserError>,
    context: TextContext
};

const CP_ZERO = 48;
const CP_NINE = 57;

/**
 * Specialized parser that accepts a single arabic digit.
 */
class DigitParser extends TextParser<number, CharParserError>
{
    runT(input: string, context: TextContext): ResultWithContext
    {
        const codePoint = input.codePointAt(context.offset.index);

        if (codePoint && CP_ZERO <= codePoint && codePoint <= CP_NINE)
        {
            return {
                result: {
                    success: true,
                    parsed: this.codePointToInt(codePoint),
                },
                context: context.withOffset({ index: 1, column: 1 })
            };
        }
        else
        {
            const actual = typeof codePoint === 'undefined'
                            ? '<eos>'
                            : String.fromCodePoint(codePoint);

            return {
                result: {
                    success: false,
                    error: {
                        expected: '0-9',
                        actual
                    }
                },
                context
            };
        }
    }

    private codePointToInt(codePoint: number): number
    {
        return codePoint - CP_ZERO;
    }
}

/**
 * @returns a parser for a single arabic digit (0-9).
 */
export const digit = Parser.of(() => new DigitParser());

/**
 * @returns a parser that matches any number of spaces.
 */
export const spaces = Parser.of((): TextParser<string, never> =>
    char(' ')
        .flatMap(s => spaces().map(t => s + t))
        .or(pure('')));
