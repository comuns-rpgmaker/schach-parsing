import { string, text } from '../../src/parser/text';

describe('Running a string parser', () =>
{
    describe('on the expected string', () =>
    {
        const parser = string('abc');
        const result = parser.run(text('abcdef'));

        it('returns success', () => expect(result.success).toBeTrue());

        it('returns the parsed string', () =>
        {            
            expect(result.success && result.parsed).toBe('abc');
        });

        it('changes the offsets on the rest', () =>
        {
            expect(result.rest.offset).toEqual({
                index: 3,
                column: 4,
                row: 1
            });
        });
    });

    describe('on the wrong string', () =>
    {
        const parser = string('abc');
        const result = parser.run(text('afbecd'));

        it('returns failure', () => expect(result.success).toBeFalse());

        it('does not change the offsets on the rest', () =>
        {
            expect(result.rest).toEqual(text('afbecd'));
        });

        it('returns the expected string', () =>
        {
            expect(result.success === false
                && result.error.expected).toEqual('abc');
        });
    });

    describe('on a string with line breaks', () =>
    {
        const parser = string('a\nb\nc');

        describe('on success', () =>
        {
            const result = parser.run(text('a\nb\nc\nd\ne\nf'));

            it('increments the row offset on the rest', () =>
            {
                expect(result.rest.offset.row).toEqual(3);
            });

            it('resets and increments the column offset on the rest', () =>
            {
                expect(result.rest.offset.column).toEqual(2);
            });
        });

        describe('on failure', () =>
        {
            const result = parser.run(text('a\nf\nb\ne\nc\nd'));

            it('maintains the row offset on the rest', () =>
            {
                expect(result.rest.offset.row).toEqual(1);
            });

            it('maintains the column offset on the rest', () =>
            {
                expect(result.rest.offset.column).toEqual(1);
            });
        });
    });
});
