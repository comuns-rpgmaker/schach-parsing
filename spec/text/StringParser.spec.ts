import { string } from '../../src/parser/text';

describe('Running a string parser', () =>
{
    describe('on the expected string', () =>
    {
        const parser = string('abc');
        const result = parser.run('abcdef');

        it('returns success', () => expect(result.success).toBeTrue());

        it('returns the parsed string', () =>
        {
            expect(result.success && result.parsed).toBe('abc');
        });
    });

    describe('on the wrong string', () =>
    {
        const parser = string('abc');
        const result = parser.run('afbecd');

        it('returns failure', () => expect(result.success).toBeFalse());

        it('returns the expected string', () =>
        {
            expect(result.success === false
                && result.error.expected).toEqual('abc');
        });
    });
});
