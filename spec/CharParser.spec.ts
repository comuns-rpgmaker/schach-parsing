import { char } from '../src/parser';

describe('Running a char parser', () =>
{
    const parser = char('a');

    describe('on the expected char', () =>
    {
        const result = parser.run('abcd');

        it('returns success', () => expect(result.success).toBeTrue());

        it('returns the parsed code point', () =>
        {
            expect(result.success && result.parsed).toBe(97);
        });

        it('removes the parsed character from the rest', () =>
        {
            expect(result.rest).toEqual('bcd');
        })
    });
});
