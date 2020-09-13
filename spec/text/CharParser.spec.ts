import { char } from 'parser/text';
import { TextContext } from 'parser/text/context';

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

        describe('with a context', () =>
        {
            const context = new TextContext();
            
            it('changes the offset by one column', () =>
            {
                const { context: resultContext } = parser.runT('abcd', context);
                expect(resultContext.offset).toEqual({
                    index: 1,
                    column: 2,
                    row: 1
                });
            });
        });
    });

    describe('on the wrong char', () =>
    {
        const parser = char('a');
        const result = parser.run('bcde');

        it('returns failure', () => expect(result.success).toBeFalse());

        it('returns the expected and actual characters', () =>
        {
            expect(result.success === false
                && result.error.expected).toEqual('a');
            
            expect(result.success === false
                && result.error.actual).toEqual('b');
        });

        describe('with a context', () =>
        {
            const context = new TextContext();
            
            it('does not change the offset', () =>
            {
                const { context: resultContext } = parser.runT('bcde', context);
                expect(resultContext.offset).toEqual({
                    index: 0,
                    column: 1,
                    row: 1
                });
            });
        });
    });
});
