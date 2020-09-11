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
 * @template S - type to parse to.
 */
export type ParseSuccess<S> = {
    success: true,

    /** Parsed value */
    parsed: S
};

/**
 * Parsing failure result type.
 * 
 * @template E - error type.
 */
export type ParseFailure<E> = {
    success: false,

    /** Error context given to identify where parsing failed */
    error: E
};

/**
 * Parsing result type.
 * 
 * @template S - type to parse to.
 * @template E - error type.
 */
export type ParseResult<S, E> = ParseSuccess<S> | ParseFailure<E>;
