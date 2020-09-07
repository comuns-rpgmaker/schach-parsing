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
 * @template E - error type.
 */
export type ParseFailure<T, E> = {
    success: false,

    /** Error context given to identify where parsing failed */
    error: E,

    /** Content remaining to be parsed */
    rest: T
};

/**
 * Parsing result type.
 * 
 * @template T - type to parse from.
 * @template S - type to parse to.
 * @template E - error type.
 */
export type ParseResult<T, S, E> = ParseSuccess<T, S> | ParseFailure<T, E>;
