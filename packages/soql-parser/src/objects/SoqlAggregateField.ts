import { BYTE_MAP } from '../byte-map'
import { SoqlObject } from './SoqlObject'
import { SoqlStringBuffer } from './SoqlStringBuffer'
import { SoqlField } from './SoqlField'

export class SoqlAggregateField extends SoqlObject {
    functionName: string
    field: SoqlField

    constructor(options: { functionName: string; field: SoqlField }) {
        super()
        this.functionName = options.functionName
        this.field = options.field
    }

    static fromString(string: string): SoqlAggregateField {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlAggregateField.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlAggregateField {
        const functionName = buffer.readString()

        buffer.skipWhitespace()
        buffer.expect(BYTE_MAP.openParen)
        buffer.skipWhitespace()

        const field = SoqlField.fromBuffer(buffer)
        buffer.skipWhitespace()
        buffer.expect(BYTE_MAP.closeParen)
        buffer.skipWhitespace()

        return new SoqlAggregateField({ functionName, field })
    }
}
