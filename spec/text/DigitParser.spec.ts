import { digit, text } from '../../src/parser/text';

describe('Running a digit parser', () =>
{
    const parser = digit();

    describe('on a digit', () =>
    {
        it('returns success', () =>
        {
            for (let i = 0; i < 10; i++)
            {
                const result = parser.run(text(i.toString()));
                expect(result.success).toBeTrue()
            }
        });

        it('returns the parsed number', () =>
        {
            for (let i = 0; i < 10; i++)
            {
                const result = parser.run(text(i.toString()));
                expect(result.success && result.parsed).toBe(i);
            }
        });

        it('changes the offsets on the rest', () =>
        {
            for (let i = 0; i < 10; i++)
            {
                const result = parser.run(text(i.toString()));
                expect(result.rest.offset).toEqual({
                    index: 1,
                    column: 2,
                    row: 1
                });
            }
        });
    });

    describe('on a non-digit', () =>
    {
        const result = parser.run(text('abcde'));

        it('returns failure', () => expect(result.success).toBeFalse());

        it('does not change the offsets on the rest', () =>
        {
            expect(result.rest).toEqual(text('abcde'));
        });

        it('returns the expected and actual characters', () =>
        {
            expect(result.success === false
                && result.error.expected).toEqual('0-9');
            
            expect(result.success === false
                && result.error.actual).toEqual('a');
        });
    });
});
