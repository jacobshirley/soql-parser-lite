import { SoqlBase } from './SoqlBase'
import { SoqlStringBuffer } from './SoqlStringBuffer'
import { SoqlField } from './SoqlField'
import { SoqlAggregateField } from './SoqlAggregateField'

export class SoqlGroupByField extends SoqlBase {
    field: SoqlField | SoqlAggregateField

    constructor(options: { field: SoqlField | SoqlAggregateField }) {
        super()
        this.field = options.field
    }

    static fromString(string: string): SoqlGroupByField {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlGroupByField.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlGroupByField {
        let field: SoqlField | SoqlAggregateField
        const possibleFunction = buffer.tryParse(() =>
            SoqlAggregateField.fromBuffer(buffer),
        )
        if (possibleFunction) {
            field = possibleFunction
        } else {
            field = SoqlField.fromBuffer(buffer)
        }

        buffer.skipWhitespace()

        return new SoqlGroupByField({ field })
    }
}
