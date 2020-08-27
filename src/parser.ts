/**
 * 
 * @file parser.ts
 * 
 * @author Brandt
 * @date 2020/08/25
 * @license Zlib
 * 
 * Parser class definition.
 * 
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

/**
 * Basic parser class.
 * 
 * @template T - type to parse from.
 * @template S - type to parse to.
 */
export abstract class Parser<T, S>
{
    /**
     * Parse an input into an output.
     * 
     * @param input - value to be parsed.
     */
    abstract run(input: T): ParseResult<T, S>;

    /**
     * Monadic flat map of parsers, applies one followed by the other and
     * returns the last accepted value.
     * 
     * @param f - mapping from the range of the parser to a parser for the
     *            desired type.
     */
    flatMap<U>(f: (value: S) => Parser<T, U>): Parser<T, U>
    {
        return new ParserFlatMap(this, f); 
    }

    /**
     * Returns a parser that accepts the same input, but returns a different
     * result based on the return of the given mapping function.
     * 
     * @param f - mapping from the range of the parser to the desired type.
     */
    map<U>(f: (value: S) => U): Parser<T, U>
    {
        return new ParserMap(this, f);
    }

    /**
     * Combines to another parser by putting the results on a tuple.
     * 
     * @param other - parser to zip with.
     */
    zip<U>(other: Parser<T, U>): Parser<T, [S, U]>
    {
        return this.flatMap(mine => other.map(their => [mine, their]))
    }

    /**
     * Returns a parser with a mapped error message.
     * 
     * @param f - function mapping from a partial parsed value to an error
     *            message.
     */
    error(f: (partial?: S, context?: T) => string): Parser<T, S>
    {
        return new ParserMapError(this, f);
    }

    /**
     * Returns a parser with a fallback.
     * 
     * @param fallback - parser to fallback to on failure.
     */
    or<U>(fallback: Parser<T, U> | (() => Parser<T, U>)): Parser<T, S | U>
    {
        return new ParserDisjunction(this, fallback);
    }
    
    /**
     * Applies another parser after this, then ignore its result.
     * 
     * @param other - parser to run after this parser.
     */
    thenDrop(
        other: Parser<T, unknown> | (() => Parser<T, unknown>)
    ): Parser<T, S>
    {        
        return this.flatMap(value =>
            (typeof other === 'function' ? other() : other).map(() => value));
    }

    /**
     * Applies another parser after this, then use its result and ignore the
     * result of this parser.
     * 
     * @param other - parser to run after this parser.
     */
    dropThen<U>(other: Parser<T, U> | (() => Parser<T, U>)): Parser<T, U>
    {
        return this.flatMap(() =>
            typeof other === 'function' ? other() : other);
    }
}

/**
 * Parser class for monad binding of parsers.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the resulting parser.
 */
class ParserFlatMap<T, S, U> extends Parser<T, U>
{
    private readonly _parser: Parser<T, S>;
    private readonly _functor: (value: S) => Parser<T, U>;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to a
     *                  parser for the desired type.
     */
    constructor(parser: Parser<T, S>, functor: (value: S) => Parser<T, U>)
    {
        super();
        this._parser = parser;
        this._functor = functor;    
    }

    run(input: T): ParseResult<T, U>
    {
        const result = this._parser.run(input);

        if (result.success)
        {
            return this._functor(result.parsed).run(result.rest);
        }
        else
        {
            return {
                ...result,
                parsed: undefined
            };
        }
    }
}

/**
 * Parser class for functor mapping of parsers.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the resulting parser.
 */
class ParserMap<T, S, U> extends Parser<T, U>
{
    private readonly _parser: Parser<T, S>;
    private readonly _functor: (value: S) => U;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to a
     *                  parser for the desired type.
     */
    constructor(parser: Parser<T, S>, functor: (value: S) => U)
    {
        super();
        this._parser = parser;
        this._functor = functor;    
    }

    run(input: T): ParseResult<T, U>
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
            return {
                ...result,
                parsed: undefined
            };
        }
    }
}

/**
 * Parser class for disjunctive combinations.
 * 
 * @template T - parser domain.
 * @template S - range of the original parser.
 * @template U - range of the fallback parser.
 */
class ParserDisjunction<T, S, U> extends Parser<T, S | U>
{
    private readonly _parser: Parser<T, S>;
    private readonly _fallback: Parser<T, U> | (() => Parser<T, U>);

    /**
     * @param parser - original parser.
     * @param fallback - fallback parser.
     */
    constructor(parser: Parser<T, S>, fallback: Parser<T, U> | (() => Parser<T, U>))
    {
        super();
        this._parser = parser;
        this._fallback = fallback;    
    }

    run(input: T): ParseResult<T, S | U>
    {
        const result = this._parser.run(input);

        if (result.success)
        {
            return result;
        }
        else
        {
            if (typeof this._fallback === 'function')
            {
                return this._fallback().run(input);
            }
            else
            {
                return this._fallback.run(input);
            }
        }
    }
}

/**
 * Parser class for error mapping of parsers.
 * 
 * @template T - parser domain.
 * @template S - parser range.
 */
class ParserMapError<T, S> extends Parser<T, S>
{
    private readonly _parser: Parser<T, S>;
    private readonly _mapper: (value?: S, context?: T) => string;

    /**
     * @param parser - original parser.
     * @param functor - mapping from the range of the original parser to an
     *                  error message.
     */
    constructor(
        parser: Parser<T, S>,
        mapper: (value?: S, context?: T) => string
    )
    {
        super();
        this._parser = parser;
        this._mapper = mapper;
    }

    run(input: T): ParseResult<T, S>
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
                message: this._mapper(result.parsed, result.context)
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
class PureParser<T, S> extends Parser<T, S>
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

    run(input: T): ParseResult<T, S>
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
export function pure<T, S>(value: S): Parser<T, S>
{
    return new PureParser(value);
}

/**
 * Applies parsers in sequence and groups the results into an array.
 * 
 * @param parsers - list of parsers to apply.
 */
export function sequence<T, S>(...parsers: Parser<T, S>[]): Parser<T, S[]>
{
    return parsers
        .slice(1)
        .reduce((parser, current) =>
            parser.flatMap(mine =>
                current.map(theirs => mine.concat(theirs))),
            parsers[0].map(Array.of)
        );
}

/**
 * Chains parsers with "or".
 * 
 * @param parsers - list of alternatives.
 */
export function oneOf<T, S>(...parsers: Parser<T, S>[]): Parser<T, S>
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
export function many1<T, S>(parser: Parser<T, S>): Parser<T, S[]>
{
    return parser
        .flatMap(head => many(parser).map(tail => [head].concat(tail)));
}

/**
 * Returns a parser that accepts zero or more repetitions of a given parser and
 * returns a list of the parsed values.
 * 
 * @param parser - parser to repeat.
 */
export function many<T, S>(parser: Parser<T, S>): Parser<T, S[]>
{
    return many1(parser).or(pure([]));
}
