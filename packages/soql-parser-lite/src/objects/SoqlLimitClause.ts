import { parseNonNegativeInteger } from '../utils.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'

export class SoqlLimitClause extends SoqlBase {
    value: number

    constructor(value: number) {
        super()
        this.value = value
    }

    static fromString(string: string): number {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlLimitClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): number {
        const keyword = buffer.readKeyword()
        if (keyword !== 'LIMIT') {
            throw new SoqlParserError(`Expected LIMIT keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        const limitString = buffer.readString()
        const limit = parseNonNegativeInteger(limitString)
        if (limit === undefined) {
            throw new SoqlParserError(
                `Invalid LIMIT value (expected a non-negative integer): ${limitString}`,
            )
        }

        return limit
    }
}
