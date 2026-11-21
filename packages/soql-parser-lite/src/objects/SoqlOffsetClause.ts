import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlBindVariable } from './SoqlValueExpr.js'

export class SoqlOffsetClause extends SoqlBase {
    value: number | SoqlBindVariable

    constructor(value: number | SoqlBindVariable) {
        super()
        this.value = value
    }

    static fromString(string: string): number | SoqlBindVariable {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlOffsetClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): number | SoqlBindVariable {
        const keyword = buffer.readKeyword()
        if (keyword !== 'OFFSET') {
            throw new SoqlParserError(
                `Expected OFFSET keyword, got: ${keyword}`,
            )
        }

        buffer.skipWhitespace()
        if (buffer.peek() === BYTE_MAP.colon) {
            return SoqlBindVariable.fromBuffer(buffer)
        }

        const offsetString = buffer.readString()
        const offset = Number(offsetString)
        if (isNaN(offset)) {
            throw new SoqlParserError(`Invalid OFFSET value: ${offsetString}`)
        }

        return offset
    }
}
