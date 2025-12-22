import { SoqlParserError } from '../errors'
import { SoqlBase } from './core/SoqlBase'
import { SoqlStringBuffer } from './core/SoqlStringBuffer'

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
        const limit = Number(limitString)
        if (isNaN(limit)) {
            throw new SoqlParserError(`Invalid LIMIT value: ${limitString}`)
        }

        return limit
    }
}
