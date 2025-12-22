import { SoqlParserError } from '../errors'
import { SoqlObject } from './SoqlObject'
import { SoqlStringBuffer } from './SoqlStringBuffer'

export class SoqlOffsetClause extends SoqlObject {
    value: number

    constructor(value: number) {
        super()
        this.value = value
    }

    static fromString(string: string): number {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlOffsetClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): number {
        const keyword = buffer.readKeyword()
        if (keyword !== 'OFFSET') {
            throw new SoqlParserError(
                `Expected OFFSET keyword, got: ${keyword}`,
            )
        }

        buffer.skipWhitespace()
        const offsetString = buffer.readString()
        const offset = Number(offsetString)
        if (isNaN(offset)) {
            throw new SoqlParserError(`Invalid OFFSET value: ${offsetString}`)
        }

        return offset
    }
}
