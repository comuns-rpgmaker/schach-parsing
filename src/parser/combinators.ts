/**
 * @file combinators.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Parser combinator functions.
 */

import { Parser, pure } from './base';

/**
 * Applies parsers in sequence and groups the results into an array.
 * 
 * @param parsers - list of parsers to apply.
 */
export
function sequence<T, S, E, C>(...parsers: Parser<T, S, E, C>[]): Parser<T, S[], E, C>
{
    return parsers
        .slice(1)
        .reduce((parser, current) =>
            parser.flatMap(mine => current.map(theirs => mine.concat(theirs))),
            parsers[0].map(Array.of));
}

/**
 * Chains parsers with "or".
 * 
 * @param parsers - list of alternatives.
 */
export
function oneOf<T, S, E, C>(...parsers: Parser<T, S, E, C>[]): Parser<T, S, E, C>
{
    return parsers.reduce((parser, current) => parser.or(current));
}

/**
 * Returns a parser that accepts one or more repetitions of a given parser and
 * returns a list of the parsed values.
 * 
 * @see many
 * @param parser - parser to repeat.
 */
export
function many1<T, S, E, C>(parser: Parser<T, S, E, C>): Parser<T, S[], E, C>
{
    return parser.flatMap(head =>
        many(parser).map(tail => [head].concat(tail)));
}

/**
 * Returns a parser that accepts zero or more repetitions of a given parser and
 * returns a list of the parsed values.
 * 
 * @param parser - parser to repeat.
 */
export
function many<T, S, E, C>(parser: Parser<T, S, E, C>): Parser<T, S[], E, C>
{
    return many1(parser).or(pure([]));
}
