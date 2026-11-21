import { BYTE_MAP } from '../byte-map.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlField } from './SoqlField.js'

export class SoqlAggregateField extends SoqlBase {
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

        // `COUNT()` is valid SOQL and takes no argument
        const field =
            functionName.toUpperCase() === 'COUNT' &&
            buffer.peek() === BYTE_MAP.closeParen
                ? new SoqlField('')
                : SoqlField.fromBuffer(buffer)
        buffer.skipWhitespace()
        buffer.expect(BYTE_MAP.closeParen)
        buffer.skipWhitespace()

        return new SoqlAggregateField({ functionName, field })
    }
}
