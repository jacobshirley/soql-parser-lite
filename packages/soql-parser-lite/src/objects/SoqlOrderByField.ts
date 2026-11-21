import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlField } from './SoqlField.js'
import { SoqlAggregateField } from './SoqlAggregateField.js'
import { SoqlFunctionCall } from './SoqlFunctionCall.js'

export class SoqlOrderByField extends SoqlBase {
    field: SoqlField | SoqlAggregateField | SoqlFunctionCall
    direction: 'ASC' | 'DESC' | null

    constructor(options: {
        field: SoqlField | SoqlAggregateField | SoqlFunctionCall
        direction: 'ASC' | 'DESC' | null
    }) {
        super()
        this.field = options.field
        this.direction = options.direction
    }

    static fromString(string: string): SoqlOrderByField {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlOrderByField.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlOrderByField {
        let field: SoqlField | SoqlAggregateField | SoqlFunctionCall

        if (buffer.peekIsFunctionCall()) {
            field = SoqlFunctionCall.fromBuffer(buffer)
        } else {
            field = SoqlField.fromBuffer(buffer)
        }

        const peekedKeyword = buffer.peekKeyword()
        if (peekedKeyword === 'ASC' || peekedKeyword === 'DESC') {
            const direction = buffer.readKeyword() as 'ASC' | 'DESC'
            return new SoqlOrderByField({ field, direction })
        }

        return new SoqlOrderByField({ field, direction: null })
    }
}
