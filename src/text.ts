import { Parser, ParseResult, sequence, oneOf, many } from './parser';

/**
 * Parses a single UTF-16 code point.
 */
class CharParser extends Parser<string, number>
{
    private readonly _codePoint: number;

    /**
     * @param codePoint - UTF-16 code point to accept.
     */
    constructor(codePoint: number)
    {
        super();
        this._codePoint = codePoint;
    }

    run(input: string): ParseResult<string, number>
    {
        const inputCodePoint = input.codePointAt(0);

        if (inputCodePoint === this._codePoint)
        {
            return {
                success: true,
                parsed: this._codePoint,
                rest: input.substr(1)
            };
        }
        else
        {
            const expected = String.fromCodePoint(this._codePoint);

            const actual = typeof inputCodePoint === 'number'
                            ? String.fromCodePoint(inputCodePoint)
                            : '<eos>';

            return {
                success: false,
                message: `expected '${expected}', got '${actual}'`,
                context: actual,
                rest: input
            };
        }
    }
}

/**
 * Creates a parser for a single character.
 * 
 * @param c - character or UTF-16 code point to be parsed.
 */
export function char(c: string | number): CharParser
{
    if (typeof c == 'string')
    {
        const codePoint = c.codePointAt(0);
        if (codePoint === undefined) throw 'string is empty';
        c = codePoint;
    }

    return new CharParser(c);
}

/**
 * Creates a parser for a string.
 * 
 * @param c - character or UTF-16 code point to be parsed.
 */
export function string(s: string): Parser<string, string>
{
    return sequence(...Array.from(s).map(char))
        .map(
            codePoints => String.fromCodePoint(...codePoints)
        )
        .error((_, context) => `expected "${s}", got "${context || ''}"`);
}

function codePointToInt(codePoint: number): number
{
    return codePoint - 48;
}

const DIGITS: string[] = Array.from({ length: 10 }, (_, i) => i.toString());

/**
 * @returns a parser for a single arabic digit (0-9).
 */
export function digit(): Parser<string, number>
{
    return oneOf(...DIGITS.map(char))
        .map(codePointToInt)
        .error((_, context) => `expected 0-9, got '${context}'`);
}

/**
 * @returns a parser that matches any number of spaces.
 */
export function spaces(): Parser<string, number[]>
{
    return many(char(' '));
}