/**
 * @file result.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Parsing result type definitions.
 */

/**
 * Parsing success result type.
 * 
 * @template T - type to parse from.
 * @template S - type to parse to.
 */
export type ParseSuccess<T, S> = {
    success: true,

    /** Parsed value */
    parsed: S,

    /** Content remaining to be parsed */
    rest: T
};

/**
 * Parsing failure result type.
 * 
 * @template T - type to parse from.
 */
export type ParseFailure<T, S> = {
    success: false,

    /** Failure description */
    message: string,

    /** Partial value that was successfully parsed, if it exists */
    parsed?: S,

    /** Context value given to identify where parsing failed */
    context: T,

    /** Content remaining to be parsed */
    rest: T
};

/**
 * Parsing result type.
 * 
 * @template T - type to parse from.
 * @template S - type to parse to.
 */
export type ParseResult<T, S> = ParseSuccess<T, S> | ParseFailure<T, S>;
