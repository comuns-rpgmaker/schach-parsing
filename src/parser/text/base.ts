/**
 * @file base.ts
 * 
 * @author Brandt
 * @date 2020/09/06
 * @license Zlib
 * 
 * Base definitions for text parsers.   
 */

import { Parser } from "../base";

/**
 * Type for an offset on a text.
 */
export type TextOffset = {
    index: number,
    column: number,
    row: number
};

/**
 * Type for an input of a text parser.
 */
export type TextInput = {
    content: string,
    offset: TextOffset
};

/**
 * Type for an error of a text parser.
 */
export type TextParseError = {
    context: TextInput
};

/**
 * Text parser base class.
 */
export abstract class TextParser<T, E extends TextParseError = TextParseError>
    extends Parser<TextInput, T, E> {}

/**
 * Creates a TextInput from a string.
 * 
 * @param content - String to be parsed.
 */
export function text(content: string): TextInput
{
    return {
        content,
        offset: {
            index: 0,
            column: 1,
            row: 1
        }
    };
}
