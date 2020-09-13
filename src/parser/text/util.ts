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
