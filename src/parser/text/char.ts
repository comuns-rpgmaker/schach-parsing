/**
 * @file char.ts
 * 
 * @author Brandt
 * @date 2020/09/06
 * @license Zlib
 * 
 * Definitions for a single-character parser.   
 */

import { ParseResult } from '../result';
import { TextParser, TextParseError, TextInput, TextOffset } from './base';

/**
 * Single-character parser error type.
 */
export type CharParserError = TextParseError & {
    expected: string,
    actual: string
};

/**
 * Parses a single UTF-16 code point.
 */
export class CharParser extends TextParser<number, CharParserError>
{
    private readonly _codePoint: number;

    /**
     * @param codePoint - UTF-16 code point to accept.
     */
    constructor(codePoint: number)
    {
        super();
        this._codePoint = codePoint;
    }

    run(input: TextInput): ParseResult<TextInput, number, CharParserError>
    {
        const inputCodePoint = input.content.codePointAt(input.offset.index);

        if (inputCodePoint === this._codePoint)
        {
            return {
                success: true,
                parsed: this._codePoint,
                rest: {
                    content: input.content,
                    offset: this.applyOffset(input)
                }
            };
        }
        else
        {
            const expected = String.fromCodePoint(this._codePoint);
            const actual = typeof inputCodePoint === 'undefined'
                            ? '<eos>'
                            : String.fromCodePoint(inputCodePoint);

            return {
                success: false,
                error: {
                    context: input,
                    expected,
                    actual
                },
                rest: input
            };
        }
    }

    private applyOffset(input: TextInput): TextOffset
    {
        const newLine = this._codePoint == 10;
        
        return {
            index: input.offset.index + 1,
            column: newLine ? 1 : input.offset.column + 1,
            row: input.offset.row + (newLine ? 1 : 0)
        };
    }
}

/**
 * Creates a parser for a single character.
 * 
 * @param c - character or UTF-16 code point to be parsed.
 */
export const char = (c: string | number): CharParser =>
    {
        if (typeof c == 'string')
        {
            const codePoint = c.codePointAt(0);
            if (codePoint === undefined) throw 'string is empty';
            c = codePoint;
        }

        return new CharParser(c);
    };