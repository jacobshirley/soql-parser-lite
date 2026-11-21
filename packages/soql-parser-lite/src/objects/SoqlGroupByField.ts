import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlField } from './SoqlField.js'
import { SoqlAggregateField } from './SoqlAggregateField.js'
import { SoqlFunctionCall } from './SoqlFunctionCall.js'

export class SoqlGroupByField extends SoqlBase {
    field: SoqlField | SoqlAggregateField | SoqlFunctionCall

    constructor(options: {
        field: SoqlField | SoqlAggregateField | SoqlFunctionCall
    }) {
        super()
        this.field = options.field
    }

    static fromString(string: string): SoqlGroupByField {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlGroupByField.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlGroupByField {
        let field: SoqlField | SoqlAggregateField | SoqlFunctionCall
        if (buffer.peekIsFunctionCall()) {
            field = SoqlFunctionCall.fromBuffer(buffer)
        } else {
            field = SoqlField.fromBuffer(buffer)
        }

        buffer.skipWhitespace()

        return new SoqlGroupByField({ field })
    }
}
