import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlSelectItem } from './SoqlSelectItem.js'

export class SoqlSelectClause extends SoqlBase {
    items: SoqlSelectItem[]

    constructor(options: { items: SoqlSelectItem[] }) {
        super()
        this.items = options.items
    }

    static fromString(string: string): SoqlSelectClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSelectClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSelectClause {
        const keyword = buffer.readKeyword()
        if (keyword !== 'SELECT') {
            throw new SoqlParserError(
                `Expected SELECT keyword, got: ${keyword}`,
            )
        }

        buffer.skipWhitespace()
        const items: SoqlSelectItem[] = []

        while (true) {
            const item = SoqlSelectItem.fromBuffer(buffer)
            items.push(item)
            buffer.skipWhitespace()
            const nextByte = buffer.peek()
            if (nextByte === BYTE_MAP.comma) {
                buffer.expect(BYTE_MAP.comma)
                buffer.skipWhitespace()
            } else {
                break
            }
        }

        return new SoqlSelectClause({ items })
    }
}
