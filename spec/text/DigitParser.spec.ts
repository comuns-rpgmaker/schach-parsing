import { digit } from 'parser/text';
import { TextContext } from 'parser/text/context';

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

        describe('with a context', () =>
        {
            const context = new TextContext();
            
            it('changes the offset by one column', () =>
            {
                const { context: resultContext } = parser.runT('1', context);
                expect(resultContext.offset).toEqual({
                    index: 1,
                    column: 2,
                    row: 1
                });
            });
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
        
        describe('with a context', () =>
        {
            const context = new TextContext();
            
            it('does not change the offset', () =>
            {
                const { context: resultContext } = parser.runT('a', context);
                expect(resultContext.offset).toEqual({
                    index: 0,
                    column: 1,
                    row: 1
                });
            });
        });
    });
});
