import { eos } from '../../src/parser/text/util';
import { TextContext } from '../../src/parser/text/context';

describe('Running an EOS parser', () =>
{
    describe('on an empty string', () =>
    {
        const parser = eos();
        const result = parser.run('');

        it('returns success', () => expect(result.success).toBeTrue());

        describe('with a context', () =>
        {
            const context = new TextContext();
            
            it('does not change the offset', () =>
            {
                const { context: resultContext } = parser.runT('', context);

                expect(resultContext.offset).toEqual({
                    index: 0,
                    column: 1,
                    row: 1
                });
            });
        });
    });

    describe('on a non-empty string with a context', () =>
    {
        const parser = eos();

        describe('at the end of the string', () =>
        {
            const offset = { index: 3, column: 4, row: 1 };
            const context = new TextContext(offset);
            const { result, context: resultContext } = parser.runT('abc', context);

            it('returns success', () => expect(result.success).toBeTrue());

            it('does not change the offset', () =>
            {
                expect(resultContext.offset).toEqual(offset);
            });
        });

        describe('not at the end of the string', () =>
        {
            const offset = { index: 1, column: 2, row: 1 };
            const context = new TextContext(offset);
            const { result, context: resultContext } = parser.runT('abc', context);

            it('returns failure', () => expect(result.success).toBeFalse());

            it('does not change the offset', () =>
            {
                expect(resultContext.offset).toEqual(offset);
            });
        });
    });
});
