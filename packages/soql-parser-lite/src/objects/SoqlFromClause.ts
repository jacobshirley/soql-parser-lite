import { BYTE_MAP } from '../byte-map'
import { SoqlParserError } from '../errors'
import { SoqlBase } from './core/SoqlBase'
import { SoqlStringBuffer } from './core/SoqlStringBuffer'
import { SoqlFromObject } from './SoqlFromObject'

export class SoqlFromClause extends SoqlBase {
    objects: SoqlFromObject[]

    constructor(options: { objects: SoqlFromObject[] }) {
        super()
        this.objects = options.objects
    }

    static fromString(string: string): SoqlFromClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlFromClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlFromClause {
        buffer.skipWhitespace()

        const keyword = buffer.readKeyword()
        if (keyword !== 'FROM') {
            throw new SoqlParserError(`Expected FROM keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        const objects: SoqlFromObject[] = []

        while (true) {
            const fromObject = SoqlFromObject.fromBuffer(buffer)
            objects.push(fromObject)

            buffer.skipWhitespace()
            const nextByte = buffer.peek()
            if (nextByte === BYTE_MAP.comma) {
                buffer.expect(BYTE_MAP.comma)
                buffer.skipWhitespace()
            } else {
                break
            }
        }

        return new SoqlFromClause({ objects })
    }
}
