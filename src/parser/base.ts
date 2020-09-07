/**
 * @file result.ts
 * 
 * @author Brandt
 * @date 2020/08/27
 * @license Zlib
 * 
 * Core definition of the Parser class.
 */

import type { ParseResult } from './result';

/**
 * Basic parser class.
 * 
 * @template T - type to parse from.
 * @template S - type to parse to.
 * @template E - error type.
 */
export abstract class Parser<T, S, E>
{
    /**
     * Parse an input into an output.
     * 
     * @param input - value to be parsed.
     */
    abstract run(input: T): ParseResult<T, S, E>;

    /**
     * Monadic flat map of parsers, applies one followed by the other and
     * returns the last accepted value.
     * 
     * @param f - mapping from the range of the parser to a parser for the
     *            desired type.
     */
    flatMap<U, F>(f: (value: S) => Parser<T, U, F>): Parser<T, U, E | F>
    {
        return new ParserFlatMap(this, f); 
    }

    /**
     * Returns a parser that accepts the same input, but returns a different
     * result based on the return of the given mapping function.
     * 
     * @param f - mapping from the range of the parser to the desired type.
     */
    map<U>(f: (value: S) => U): Parser<T, U, E>
    {
        return new ParserMap(this, f);
    }

    /**
     * Combines to another parser by putting the results on a tuple.
     * 
     * @param other - parser to zip with.
     */
    zip<U>(other: Parser<T, U, E>): Parser<T, [S, U], E>
    {
        return this.flatMap(mine => other.map(their => [mine, their]))
    }

    /**
     * Returns a parser with a mapped error message.
     * 
     * @param f - function mapping from a partial parsed value to an error
     *            message.
     */
    error<F>(f: (error?: E) => F): Parser<T, S, F>
    {
        return new ParserMapError(this, f);
    }

    /**
     * Returns a parser with a fallback.
     * 
     * @param fallback - parser to fallback to on failure.
     */
    or<U, F>(fallback: Parser<T, U, F>): Parser<T, S | U, F>
    {
        return new ParserDisjunction(this, fallback);
    }
    
    /**
     * Applies another parser after this, then ignore its result.
     * 
     * @param other - parser to run after this parser.
     */
    thenDrop<F>(other: Parser<T, unknown, F>): Parser<T, S, E | F>
    {
        return this.flatMap(value => other.map(() => value));
    }

    /**
     * Applies another parser after this, then use its result and ignore the
     * result of this parser.
     * 
     * @param other - parser to run after this parser.
     */
    dropThen<U, F>(other: Parser<T, U, F>): Parser<T, U, E | F>
    {
        return this.flatMap(() => other);
    }

    /**
     * Wraps a parser provider.
     * 
     * @param provider - parser provider.
     */
    static of<T, S, E>(provider: () => Parser<T, S, E>): (() => Parser<T, S, E>)
    {
        let memo: Parser<T, S, E>;
        return () => memo || (memo = provider());
    }
}

/**
 * Parser class for monad binding of parsers.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the resulting parser.
 * @template E - error type.
 * @template F - resulting error type.
 */
class ParserFlatMap<T, S, U, E, F> extends Parser<T, U, E | F>
{
    private readonly _parser: Parser<T, S, E>;
    private readonly _functor: (value: S) => Parser<T, U, F>;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to a
     *                  parser for the desired type.
     */
    constructor(parser: Parser<T, S, E>, functor: (value: S) => Parser<T, U, F>)
    {
        super();
        this._parser = parser;
        this._functor = functor;    
    }

    run(input: T): ParseResult<T, U, E | F>
    {
        const result = this._parser.run(input);

        if (result.success)
        {
            return this._functor(result.parsed).run(result.rest);
        }
        else
        {
            return result;
        }
    }
}

/**
 * Parser class for functor mapping of parsers.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the resulting parser.
 * @template E - error type.
 */
class ParserMap<T, S, U, E> extends Parser<T, U, E>
{
    private readonly _parser: Parser<T, S, E>;
    private readonly _functor: (value: S) => U;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to a
     *                  parser for the desired type.
     */
    constructor(parser: Parser<T, S, E>, functor: (value: S) => U)
    {
        super();
        this._parser = parser;
        this._functor = functor;
    }

    run(input: T): ParseResult<T, U, E>
    {
        const result = this._parser.run(input);

        if (result.success)
        {
            return {
                ...result,
                parsed: this._functor(result.parsed)
            };
        }
        else
        {
            return result;
        }
    }
}

/**
 * Parser class for disjunctive combinations.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the fallback parser.
 * @template E - error type.
 */
class ParserDisjunction<T, S, U, E> extends Parser<T, S | U, E>
{
    private readonly _parser: Parser<T, S, unknown>;
    private readonly _fallback: Parser<T, U, E>;

    /**
     * @param parser - original parser.
     * @param fallback - fallback parser.
     */
    constructor(parser: Parser<T, S, unknown>, fallback: Parser<T, U, E>)
    {
        super();
        this._parser = parser;
        this._fallback = fallback;    
    }

    run(input: T): ParseResult<T, S | U, E>
    {
        const result = this._parser.run(input);

        if (result.success)
        {
            return result;
        }
        else
        {
            return this._fallback.run(input);
        }
    }
}

/**
 * Parser class for error mapping of parsers.
 * 
 * @template T - parser domain.
 * @template S - parser range.
 * @template E - original error type.
 * @template F - resulting error type.
 */
class ParserMapError<T, S, E, F> extends Parser<T, S, F>
{
    private readonly _parser: Parser<T, S, E>;
    private readonly _mapper: (context?: E) => F;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to an
     *                  error message.
     */
    constructor(
        parser: Parser<T, S, E>,
        mapper: (context?: E) => F
    )
    {
        super();
        this._parser = parser;
        this._mapper = mapper;
    }

    run(input: T): ParseResult<T, S, F>
    {
        const result = this._parser.run(input);

        if (result.success)
        {
            return result;
        }
        else
        {
            return {
                ...result,
                error: this._mapper(result.error)
            };
        }
    }
}

/**
 * Parser class for pure values.
 * 
 * @template T - parser domain.
 * @template S - parser range.
 */
class PureParser<T, S> extends Parser<T, S, never>
{
    private readonly _value: S;

    /**
     * @param value - return value.
     */
    constructor(value: S)
    {
        super();
        this._value = value;  
    }

    run(input: T): ParseResult<T, S, never>
    {
        return {
            success: true,
            parsed: this._value,
            rest: input
        };
    }
}

/**
 * Creates a parser that always returns a value without consuming any input.
 * 
 * @param value - value to be returned.
 */
export function pure<T, S>(value: S): Parser<T, S, never>
{
    return new PureParser(value);
}
