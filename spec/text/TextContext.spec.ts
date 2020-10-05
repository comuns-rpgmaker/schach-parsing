import { TextContext } from 'parser/text/context';

const context = new TextContext({
    index: 0,
    column: 4,
    row: 1
});

describe('Applying an offset to a text context', () =>
{
    describe('of index only', () =>
    {
        const newContext = context.withOffset({ index: 3 });

        it('changes the index only', () =>
        {
            expect(newContext.offset).toEqual({
                index: 3,
                column: 4,
                row: 1
            });
        });
    });

    describe('of column only', () =>
    {
        const newContext = context.withOffset({ column: 5 });

        it('changes the column only', () =>
        {
            expect(newContext.offset).toEqual({
                index: 0,
                column: 9,
                row: 1
            });
        });
    });

    describe('of row only', () =>
    {
        const newContext = context.withOffset({ row: 6 });

        it('changes the row', () =>
        {
            expect(newContext.offset.row).toEqual(7);
        });

        it('does not change the index', () =>
        {
            expect(newContext.offset.index).toEqual(0);
        });

        it('resets the column', () =>
        {
            expect(newContext.offset.column).toEqual(1);
        });
    });

    describe('of row and column', () =>
    {
        const newContext = context.withOffset({ row: 6, column: 2 });

        it('changes the row', () =>
        {
            expect(newContext.offset.row).toEqual(7);
        });

        it('does not change the index', () =>
        {
            expect(newContext.offset.index).toEqual(0);
        });

        it('resets the column then applies the offset', () =>
        {
            expect(newContext.offset.column).toEqual(3);
        });
    });
});
