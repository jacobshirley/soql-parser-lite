import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlGroupByField } from './SoqlGroupByField.js'

export class SoqlGroupByClause extends SoqlBase {
    fields: SoqlGroupByField[]
    groupingFunction?: 'ROLLUP' | 'CUBE'

    constructor(options: {
        fields: SoqlGroupByField[]
        groupingFunction?: 'ROLLUP' | 'CUBE'
    }) {
        super()
        this.fields = options.fields
        this.groupingFunction = options.groupingFunction
    }

    static fromString(string: string): SoqlGroupByClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlGroupByClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlGroupByClause {
        let keyword = buffer.readKeyword()
        if (keyword !== 'GROUP') {
            throw new SoqlParserError(`Expected GROUP keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        keyword = buffer.readKeyword()
        if (keyword !== 'BY') {
            throw new SoqlParserError(`Expected BY keyword, got: ${keyword}`)
        }
        buffer.skipWhitespace()

        let groupingFunction: 'ROLLUP' | 'CUBE' | undefined = undefined
        const possibleKeyword = buffer.peekKeyword()
        if (possibleKeyword === 'ROLLUP' || possibleKeyword === 'CUBE') {
            buffer.readKeyword() // consume the keyword
            groupingFunction = possibleKeyword
            buffer.expect(BYTE_MAP.openParen)
            buffer.skipWhitespace()
        }

        const fields: SoqlGroupByField[] = []

        while (true) {
            const field = SoqlGroupByField.fromBuffer(buffer)
            fields.push(field)

            buffer.skipWhitespace()
            const nextByte = buffer.peek()
            if (nextByte === BYTE_MAP.comma) {
                buffer.expect(BYTE_MAP.comma)
                buffer.skipWhitespace()
            } else {
                break
            }
        }

        if (groupingFunction) {
            buffer.skipWhitespace()
            buffer.expect(BYTE_MAP.closeParen)
            buffer.skipWhitespace()
        }

        return new SoqlGroupByClause({
            fields,
            groupingFunction,
        })
    }
}
