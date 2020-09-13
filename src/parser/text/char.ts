/**
 * @file char.ts
 * 
 * @author Brandt
 * @date 2020/09/06
 * @license Zlib
 * 
 * Definitions for a single-character parser.   
 */

import { TextParser, TextParsing } from './base';

import { TextContext, TextOffset } from './context';

/**
 * Single-character parser error type.
 */
export type CharParserError = {
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

    runT(input: string, context: TextContext): TextParsing<number, CharParserError>
    {
        const inputCodePoint = input.codePointAt(context.offset.index);

        if (inputCodePoint === this._codePoint)
        {
            return {
                rest: input,
                context: context.withOffset(this.offset()),
                result: {
                    success: true,
                    parsed: this._codePoint,
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
                rest: input,
                context,
                result: {
                    success: false,
                    error: { expected, actual }
                }
            };
        }
    }

    private offset(): TextOffset
    {
        const newLine = this._codePoint === 10;
        
        return {
            index: 1,
            row: newLine ? 1 : 0,
            column: 1
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
