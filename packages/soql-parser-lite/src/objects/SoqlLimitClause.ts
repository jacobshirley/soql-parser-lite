import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlBindVariable } from './SoqlValueExpr.js'

export class SoqlLimitClause extends SoqlBase {
    value: number | SoqlBindVariable

    constructor(value: number | SoqlBindVariable) {
        super()
        this.value = value
    }

    static fromString(string: string): number | SoqlBindVariable {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlLimitClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): number | SoqlBindVariable {
        const keyword = buffer.readKeyword()
        if (keyword !== 'LIMIT') {
            throw new SoqlParserError(`Expected LIMIT keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        if (buffer.peek() === BYTE_MAP.colon) {
            return SoqlBindVariable.fromBuffer(buffer)
        }

        const limitString = buffer.readString()
        const limit = Number(limitString)
        if (isNaN(limit)) {
            throw new SoqlParserError(`Invalid LIMIT value: ${limitString}`)
        }

        return limit
    }
}
