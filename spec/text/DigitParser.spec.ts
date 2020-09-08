import { digit } from '../../src/parser/text';

describe('Running a digit parser', () =>
{
    const parser = digit();

    describe('on a digit', () =>
    {
        it('returns success', () =>
        {
            for (let i = 0; i < 10; i++)
            {
                const result = parser.run(i.toString());
                expect(result.success).toBeTrue()
            }
        });

        it('returns the parsed number', () =>
        {
            for (let i = 0; i < 10; i++)
            {
                const result = parser.run(i.toString());
                expect(result.success && result.parsed).toBe(i);
            }
        });
    });

    describe('on a non-digit', () =>
    {
        const result = parser.run('abcde');

        it('returns failure', () => expect(result.success).toBeFalse());

        it('returns the expected and actual characters', () =>
        {
            expect(result.success === false
                && result.error.expected).toEqual('0-9');
            
            expect(result.success === false
                && result.error.actual).toEqual('a');
        });
    });
});
