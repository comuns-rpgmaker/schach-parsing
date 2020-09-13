/**
 * @file base.ts
 * 
 * @author Brandt
 * @date 2020/09/06
 * @license Zlib
 * 
 * Base definitions for text parsers.   
 */

import { Parsing, Parser } from "../base";

import { TextContext } from "./context";

/**
 * Text parsing data type.
 * 
 * @template T - parsing result type.
 * @template E - error type.
 */
export type TextParsing<T, E> = Parsing<string, T, E, TextContext>;

/**
 * Text parser base class.
 */
export abstract class TextParser<T, E>
    extends Parser<string, T, E, TextContext>
{
    constructor()
    {
        super(() => new TextContext);
    }

    abstract runT(input: string, context: TextContext): TextParsing<T, E>;
}
