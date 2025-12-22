import { BYTE_MAP } from '../byte-map'
import { SoqlBase } from './SoqlBase'
import { SoqlStringBuffer } from './SoqlStringBuffer'
import { SoqlField } from './SoqlField'
import { SoqlAggregateField } from './SoqlAggregateField'
import { SoqlSubquery } from './SoqlSubquery'

export class SoqlSelectItem extends SoqlBase {
    item: SoqlField | SoqlAggregateField | SoqlSubquery
    alias?: string

    constructor(options: {
        item: SoqlField | SoqlAggregateField | SoqlSubquery
        alias?: string
    }) {
        super()
        this.item = options.item
        if (options.alias) this.alias = options.alias
    }

    static fromString(string: string): SoqlSelectItem {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSelectItem.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSelectItem {
        buffer.skipWhitespace()

        if (buffer.peek() === BYTE_MAP.openParen) {
            buffer.expect(BYTE_MAP.openParen) // consume '('
            const subquery = SoqlSubquery.fromBuffer(buffer)
            return new SoqlSelectItem({ item: subquery })
        }

        let item: SoqlField | SoqlAggregateField

        const possibleFunction = buffer.tryParse(() =>
            SoqlAggregateField.fromBuffer(buffer),
        )

        if (possibleFunction) {
            item = possibleFunction
        } else {
            item = SoqlField.fromBuffer(buffer)
        }

        buffer.skipWhitespace()

        if (buffer.peek() === BYTE_MAP.comma || buffer.peek() === null) {
            return new SoqlSelectItem({ item })
        }

        let alias: string | undefined = undefined
        const possibleKeyword = buffer.peekKeyword()
        if (!possibleKeyword) {
            alias = buffer.readString()
        }

        return new SoqlSelectItem({ item, alias })
    }
}
