import { char } from '../../src/parser/text';

describe('Running a char parser', () =>
{
    describe('on the expected char', () =>
    {
        const parser = char('a');
        const result = parser.run('abcd');

        it('returns success', () => expect(result.success).toBeTrue());

        it('returns the parsed code point', () =>
        {            
            expect(result.success && result.parsed).toBe(97);
        });

        it('changes the offsets on the rest', () =>
        {
            expect(result.context.offset).toEqual({
                index: 1,
                column: 2,
                row: 1
            });
        });
    });

    describe('on the wrong char', () =>
    {
        const parser = char('a');
        const result = parser.run('bcde');

        it('returns failure', () => expect(result.success).toBeFalse());

        it('does not change the offsets on the rest', () =>
        {
            expect(result.rest).toEqual('bcde');
        });

        it('returns the expected and actual characters', () =>
        {
            expect(result.success === false
                && result.error.expected).toEqual('a');
            
            expect(result.success === false
                && result.error.actual).toEqual('b');
        });
    });

    describe('when the char is a line break', () =>
    {
        const parser = char('\n');
        const result = parser.run('\nabc');

        it('increments the row offset on the rest', () =>
        {
            expect(result.context.offset.row).toEqual(2);
        });

        it('resets the column offset on the rest', () =>
        {
            expect(result.context.offset.column).toEqual(1);
        });
    });
});
