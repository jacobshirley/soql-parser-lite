import { BYTE_MAP } from '../byte-map'
import { SoqlParserError } from '../errors'
import { SoqlBase } from './SoqlBase'
import { SoqlStringBuffer } from './SoqlStringBuffer'
import { SoqlOrderByField } from './SoqlOrderByField'

export class SoqlOrderByClause extends SoqlBase {
    fields: SoqlOrderByField[] // OrderByField[]

    constructor(fields: SoqlOrderByField[]) {
        super()
        this.fields = fields
    }

    static fromString(string: string): SoqlOrderByClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlOrderByClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlOrderByClause {
        let keyword = buffer.readKeyword()
        if (keyword !== 'ORDER') {
            throw new SoqlParserError(`Expected ORDER keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        keyword = buffer.readKeyword()
        if (keyword !== 'BY') {
            throw new SoqlParserError(`Expected BY keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        const fields: SoqlOrderByField[] = []

        while (true) {
            const field = SoqlOrderByField.fromBuffer(buffer)
            buffer.skipWhitespace()

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

        return new SoqlOrderByClause(fields)
    }
}
