import { SoqlBase } from './core/SoqlBase'
import { SoqlStringBuffer } from './core/SoqlStringBuffer'
import { SoqlField } from './SoqlField'
import { SoqlAggregateField } from './SoqlAggregateField'

export class SoqlOrderByField extends SoqlBase {
    field: SoqlField | SoqlAggregateField
    direction: 'ASC' | 'DESC' | null

    constructor(options: {
        field: SoqlField | SoqlAggregateField
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
        let field: SoqlField | SoqlAggregateField

        const possibleFunction = buffer.tryParse(() =>
            SoqlAggregateField.fromBuffer(buffer),
        )

        if (possibleFunction) {
            field = possibleFunction
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
