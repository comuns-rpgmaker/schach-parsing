/**
 * @file context.ts
 * 
 * @author Brandt
 * @date 2020/09/07
 * @license Zlib
 * 
 * Definitions for the context passing type of text parsers.   
 */

/**
 * Type for an offset on a text.
 */
export type TextOffset = {
    index: number,
    row: number,
    column: number
};

/**
 * Type for text context information.
 */
export class TextContext
{
    readonly _offset: TextOffset;

    constructor(offset: TextOffset = { index: 0, row: 1, column: 1 })
    {
        this._offset = offset;
    }

    get offset(): TextOffset
    {
        return this._offset;
    }

    /**
     * Returns a new context a number of lines after after this one.
     * 
     * @param amount - number of lines to add (default = 1).
     */
    withOffset(
        {
            index = 0,
            row = 0,
            column = 0
        }: Partial<TextOffset>
    ): TextContext
    {
        return new TextContext({
            index: this._offset.index + index,
            row: this._offset.row + row,
            column: row > 0 ? 1 + column : this._offset.column + column
        });
    }
}
