/**
 * @file string.ts
 * 
 * @author Brandt
 * @date 2020/09/06
 * @license Zlib
 * 
 * Definitions for a parser that matches a string.   
 */

import { ParseResult } from '../result';
import { TextParser, TextParseError, TextInput, TextOffset } from './base';

/**
 * Single-character parser error type.
 */
export type StringParserError = TextParseError & {
    expected: string,
    actual: string
};

/**
 * Parser that accepts a whole string and returns it.
 */
export class StringParser extends TextParser<string, StringParserError>
{
    private readonly _pattern: string;

    /**
     * @param codePoint - UTF-16 code point to accept.
     */
    constructor(pattern: string)
    {
        super();
        this._pattern = pattern;
    }

    run(input: TextInput): ParseResult<TextInput, string, StringParserError>
    {
        const parsed = this.match(input.content.substr(input.offset.index));        

        if (parsed !== null)
        {
            return {
                success: true,
                parsed,
                rest: {
                    content: input.content,
                    offset: this.applyOffset(input, parsed)
                }
            };
        }
        else
        {
            const expected = this._pattern;
            const actual = input.content[input.offset.index] || '<eos>';
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

    private match(data: string): string | null
    {
        if (data.startsWith(this._pattern))
        {
            return this._pattern;
        }
        else
        {
            return null;
        }
    }

    private applyOffset(input: TextInput, match: string): TextOffset
    {
        const lines = match.split('\n');
        
        return {
            index: input.offset.index + match.length,
            column: lines.length === 1
                ? input.offset.column + match.length
                : lines[lines.length - 1].length + 1,
            row: input.offset.row + (lines.length - 1)
        };
    }
}

/**
 * Creates a parser for a string.
 * 
 * @param c - character or UTF-16 code point to be parsed.
 */
export const string = (s: string): StringParser => new StringParser(s);
