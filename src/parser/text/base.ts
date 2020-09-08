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
import { TextContext } from "./context";

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
}
