import { Parser, pure } from '../base';
import { ParseResult } from '../result';

import { char, CharParserError } from './char'; 
import { TextParser, TextInput } from './base';

const CP_ZERO = 48;
const CP_NINE = 57;

/**
 * Specialized parser that accepts a single arabic digit.
 */
class DigitParser extends TextParser<number, CharParserError>
{
    run(input: TextInput): ParseResult<TextInput, number, CharParserError> {
        const codePoint = input.content.codePointAt(input.offset.index);

        if (codePoint && CP_ZERO <= codePoint && codePoint <= CP_NINE)
        {
            return {
                success: true,
                parsed: this.codePointToInt(codePoint),
                rest: {
                    content: input.content,
                    offset: {
                        index: input.offset.index + 1,
                        column: input.offset.column + 1,
                        row: input.offset.row
                    }
                }
            };
        }
        else
        {
            const actual = typeof codePoint === 'undefined'
                            ? '<eos>'
                            : String.fromCodePoint(codePoint);

            return {
                success: false,
                error: {
                    context: input,
                    expected: '0-9',
                    actual
                },
                rest: input
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
export const spaces = Parser.of((): TextParser<string> =>
    char(' ').flatMap(() => spaces()).or(pure('')));
