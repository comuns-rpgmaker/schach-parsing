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
import { TextParser } from './base';
import { TextContext, TextOffset } from './context';

/**
 * Single-character parser error type.
 */
export type StringParserError = {
    expected: string
};

type ResultWithContext = {
    result: ParseResult<string, StringParserError>,
    context: TextContext
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

    runT(input: string, context: TextContext): ResultWithContext
    {
        const parsed = this.match(input.substr(context.offset.index));        

        if (parsed !== null)
        {
            return {
                result: {
                    success: true,
                    parsed
                },
                context: context.withOffset(this.offset(parsed))
            };
        }
        else
        {
            const expected = this._pattern;
            return {
                result: {
                    success: false,
                    error: {
                        expected
                    },
                },
                context
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

    private offset(match: string): TextOffset
    {
        const lines = match.split('\n');
        return {
            index: match.length,
            column: lines[lines.length - 1].length,
            row: lines.length
        };
    }
}

/**
 * Creates a parser for a string.
 * 
 * @param c - character or UTF-16 code point to be parsed.
 */
export const string = (s: string): StringParser => new StringParser(s);
