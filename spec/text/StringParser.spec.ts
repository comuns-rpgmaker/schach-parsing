import { string, TextContext } from 'parser/text';

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

        describe('with a context', () =>
        {
            const context = new TextContext();
            
            it('changes the offset by the length of the parsed string', () =>
            {
                const { context: resultContext } = parser.runT('abcd', context);

                expect(resultContext.offset).toEqual({
                    index: 3,
                    column: 4,
                    row: 1
                });
            });
            
            describe('on a multiline string', () =>
            {
                const multilineParser = string('a\nb\nc');
                const { context: resultContext } = multilineParser.runT('a\nb\ncd', context);

                it('increments the row count by the number of lines', () =>
                {
                    expect(resultContext.offset.row).toEqual(3);
                });

                it('sets the column count to the length of the last segment', () =>
                {
                    expect(resultContext.offset.column).toEqual(2);
                });
            });
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

        describe('with a context', () =>
        {
            const context = new TextContext();
            
            it('does not change the offset', () =>
            {
                const { context: resultContext } = parser.runT('afbecd', context);
                expect(resultContext.offset).toEqual({
                    index: 0,
                    column: 1,
                    row: 1
                });
            });

            describe('on a multiline string', () =>
            {
                const multilineParser = string('a\nb\nc');
                const { context: resultContext } = multilineParser.runT('a\nb\ndc', context);

                it('does not change the offset', () =>
                {
                    expect(resultContext.offset).toEqual({
                        index: 0,
                        column: 1,
                        row: 1
                    });
                });
            });
        });
    });
});
