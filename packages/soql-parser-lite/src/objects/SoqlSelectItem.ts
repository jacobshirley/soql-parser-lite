import { BYTE_MAP } from '../byte-map.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlField } from './SoqlField.js'
import { SoqlAggregateField } from './SoqlAggregateField.js'
import { SoqlSubquery } from './SoqlSubquery.js'
import { RESERVED_ALIAS_KEYWORDS } from '../types.js'

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
            buffer.expect(BYTE_MAP.closeParen) // consume ')'

            buffer.skipWhitespace()
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
        const nextWord = buffer.peekString().toUpperCase()
        if (
            !(RESERVED_ALIAS_KEYWORDS as readonly string[]).includes(nextWord)
        ) {
            alias = buffer.readString()
        }

        return new SoqlSelectItem({ item, alias })
    }
}
