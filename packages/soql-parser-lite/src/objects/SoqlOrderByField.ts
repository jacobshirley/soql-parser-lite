import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlField } from './SoqlField.js'
import { SoqlAggregateField } from './SoqlAggregateField.js'

export class SoqlOrderByField extends SoqlBase {
    field: SoqlField | SoqlAggregateField
    direction: 'ASC' | 'DESC' | null
    /** `NULLS FIRST` / `NULLS LAST`, if given */
    nulls?: 'FIRST' | 'LAST'

    constructor(options: {
        field: SoqlField | SoqlAggregateField
        direction: 'ASC' | 'DESC' | null
        nulls?: 'FIRST' | 'LAST'
    }) {
        super()
        this.field = options.field
        this.direction = options.direction
        if (options.nulls) this.nulls = options.nulls
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

        let direction: 'ASC' | 'DESC' | null = null
        const peekedKeyword = buffer.peekKeyword()
        if (peekedKeyword === 'ASC' || peekedKeyword === 'DESC') {
            direction = buffer.readKeyword() as 'ASC' | 'DESC'
        }

        let nulls: 'FIRST' | 'LAST' | undefined = undefined
        if (buffer.peekKeyword() === 'NULLS') {
            buffer.readKeyword() // NULLS
            const position = buffer.readString().toUpperCase()
            if (position !== 'FIRST' && position !== 'LAST') {
                throw new SoqlParserError(
                    `Expected FIRST or LAST after NULLS, got: ${position || 'end of input'}`,
                )
            }
            nulls = position
        }

        return new SoqlOrderByField({ field, direction, nulls })
    }
}
