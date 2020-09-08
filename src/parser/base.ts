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
 * @template C - context passing type.
 */
export abstract class Parser<T, S, E, C>
{
    private readonly _contextProvider: () => C;

    /**
     * @param contextProvider - a function that creates a context for parsing. 
     */
    constructor(contextProvider: () => C)
    {
        this._contextProvider = contextProvider;
    }

    /**
     * @returns the context provider function for this parser.
     */
    get contextProvider(): () => C
    {
        return this._contextProvider;
    }

    /**
     * Run the parser on an input.
     * 
     * @param input - value to be parsed.
     * @param context - parsing context.
     */
    abstract runT(input: T, context: C): {
        result: ParseResult<S, E>, 
        context: C
    };

    /**
     * Run the parser on an input.
     * 
     * @param input - value to be parsed.
     */
    run(input: T): ParseResult<S, E>
    {
        return this.runT(input, this._contextProvider()).result;
    }

    /**
     * Applies a function to this parser and returns the result.
     * 
     * @param f - mapping function to be applied. 
     */
    transform<A, B, F, D>(
        f: (parser: Parser<T, S, E, C>) => Parser<A, B, F, D>
    ): Parser<A, B, F, D>
    {
        return f(this);
    }

    /**
     * Monadic flat map of parsers, applies one followed by the other and
     * returns the last accepted value.
     * 
     * @param f - mapping from the range of the parser to a parser for the
     *            desired type.
     */
    flatMap<U, F>(f: (value: S) => Parser<T, U, F, C>): Parser<T, U, E | F, C>
    {
        return new ParserFlatMap(this, f); 
    }

    /**
     * Returns a parser that accepts the same input, but returns a different
     * result based on the return of the given mapping function.
     * 
     * @param f - mapping from the range of the parser to the desired type.
     */
    map<U>(f: (value: S) => U): Parser<T, U, E, C>
    {
        return new ParserMap(this, f);
    }

    /**
     * Returns this parser with its context mapped by a function.
     * 
     * @note the context is mapped even if the parser fails.
     * 
     * @param f - mapping from the original context type to the desired type.
     */
    mapContext(f: (context: C) => C): Parser<T, S, E, C>
    {
        return new ParserMapContext(this, f);
    }

    /**
     * Combines to another parser by putting the results on a tuple.
     * 
     * @param other - parser to zip with.
     */
    zip<U, F>(other: Parser<T, U, F, C>): Parser<T, [S, U], E | F, C>
    {
        return this.flatMap((mine) => other.map(their => [mine, their] as [S, U]));
    }

    /**
     * Returns a parser with a mapped error message.
     * 
     * @param f - function mapping from a partial parsed value to an error
     *            message.
     */
    error<F>(f: (error?: E) => F): Parser<T, S, F, C>
    {
        return new ParserMapError(this, f);
    }

    /**
     * Returns a parser with a fallback.
     * 
     * @param fallback - parser to fallback to on failure.
     */
    or<U, F>(fallback: Parser<T, U, F, C>): Parser<T, S | U, F, C>
    {
        return new ParserDisjunction(this, fallback);
    }
    
    /**
     * Applies another parser after this, then ignore its result.
     * 
     * @param other - parser to run after this parser.
     */
    thenDrop<F>(other: Parser<T, unknown, F, C>): Parser<T, S, E | F, C>
    {
        return this.flatMap(value => other.map(() => value));
    }

    /**
     * Applies another parser after this, then use its result and ignore the
     * result of this parser.
     * 
     * @param other - parser to run after this parser.
     */
    dropThen<U, F>(other: Parser<T, U, F, C>): Parser<T, U, E | F, C>
    {
        return this.flatMap(() => other);
    }

    /**
     * Wraps a parser provider with memoization.
     * 
     * @param provider - parser provider.
     */
    static of<T, S, E, C>(
        provider: () => Parser<T, S, E, C>
    ): (() => Parser<T, S, E, C>)
    {
        let memo: Parser<T, S, E, C>;
        return () => memo || (memo = provider());
    }
}

/**
 * Parser class for monadic binding of parsers.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the resulting parser.
 * @template E - error type.
 * @template F - resulting error type.
 * @template C - original context type.
 * @template D - resulting context type.
 */
class ParserFlatMap<T, S, U, E, F, C> extends Parser<T, U, E | F, C>
{
    private readonly _parser: Parser<T, S, E, C>;
    private readonly _functor: (value: S) => Parser<T, U, F, C>;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to a
     *                  parser for the desired type.
     */
    constructor(
        parser: Parser<T, S, E, C>,
        functor: (value: S) => Parser<T, U, F, C>
    )
    {
        super(parser.contextProvider);
        this._parser = parser;
        this._functor = functor;    
    }

    runT(input: T, context: C): { result: ParseResult<U, E | F>, context: C }
    {
        const {
            result,
            context: resultContext
        } = this._parser.runT(input, context);

        if (result.success)
        {
            return this._functor(result.parsed).runT(input, resultContext);
        }
        else
        {
            return { result, context };
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
 * @template C - context type.
 */
class ParserMap<T, S, U, E, C> extends Parser<T, U, E, C>
{
    private readonly _parser: Parser<T, S, E, C>;
    private readonly _functor: (value: S) => U;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to a
     *                  parser for the desired type.
     */
    constructor(parser: Parser<T, S, E, C>, functor: (value: S) => U)
    {
        super(parser.contextProvider);
        this._parser = parser;
        this._functor = functor;
    }

    runT(input: T, context: C): { result: ParseResult<U, E>, context: C }
    {
        const {
            result,
            context: resultContext
        } = this._parser.runT(input, context);

        if (result.success)
        {
            return {
                result: {
                    ...result,
                    parsed: this._functor(result.parsed)
                },
                context: resultContext
            };
        }
        else
        {
            return { result, context };
        }
    }
}

/**
 * Parser class for functor mapping of parser contexts.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template E - error type.
 * @template C - original context type.
 * @template D - resulting context type.
 */
class ParserMapContext<T, S, E, C> extends Parser<T, S, E, C>
{
    private readonly _parser: Parser<T, S, E, C>;
    private readonly _functor: (value: C) => C;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the originalto context type to the desired
     *                  type.
     */
    constructor(parser: Parser<T, S, E, C>, functor: (context: C) => C)
    {
        super(() => functor(parser.contextProvider()));
        this._parser = parser;
        this._functor = functor;
    }

    runT(input: T, context: C): { result: ParseResult<S, E>, context: C }
    {
        const {
            result,
            context: resultContext
        } = this._parser.runT(input, context);

        return {
            result,
            context: this._functor(resultContext)
        };
    }
}

/**
 * Parser class for disjunctive combinations.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the fallback parser.
 * @template E - error type.
 * @template C - original context type.
 * @template D - fallback context type.
 */
class ParserDisjunction<T, S, U, E, C> extends Parser<T, S | U, E, C>
{
    private readonly _parser: Parser<T, S, unknown, C>;
    private readonly _fallback: Parser<T, U, E, C>;

    /**
     * @param parser - original parser.
     * @param fallback - fallback parser.
     */
    constructor(parser: Parser<T, S, unknown, C>, fallback: Parser<T, U, E, C>)
    {
        super(parser.contextProvider);
        this._parser = parser;
        this._fallback = fallback;
    }

    runT(input: T, context: C): { result: ParseResult<S | U, E>, context: C }
    {
        const {
            result,
            context: resultContext
        } = this._parser.runT(input, context);

        if (result.success)
        {
            return {
                result,
                context: resultContext
            };
        }
        else
        {
            return this._fallback.runT(input, context);
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
class ParserMapError<T, S, E, F, C> extends Parser<T, S, F, C>
{
    private readonly _parser: Parser<T, S, E, C>;
    private readonly _mapper: (context?: E) => F;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to an
     *                  error message.
     */
    constructor(
        parser: Parser<T, S, E, C>,
        mapper: (context?: E) => F
    )
    {
        super(parser.contextProvider);
        this._parser = parser;
        this._mapper = mapper;
    }

    runT(input: T, context: C): { result: ParseResult<S, F>, context: C }
    {
        const {
            result,
            context: resultContext
        } = this._parser.runT(input, context);

        if (result.success)
        {
            return { result, context: resultContext };
        }
        else
        {
            return {
                result: {
                    ...result,
                    error: this._mapper(result.error)
                },
                context
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
class PureParser<T, S, C> extends Parser<T, S, never, C>
{
    private readonly _value: S;

    /**
     * @param value - return value.
     */
    constructor(value: S)
    {
        super(() => { throw undefined; });
        this._value = value;
    }

    runT(input: T, context: C): { result: ParseResult<S, never>, context: C }
    {
        return {
            result: {
                success: true,
                parsed: this._value,
            },
            context
        };
    }
}

/**
 * Creates a parser that always returns a value without consuming any input.
 * 
 * @param value - value to be returned.
 */
export function pure<T, S, C>(value: S): PureParser<T, S, C>
{
    return new PureParser(value);
}
