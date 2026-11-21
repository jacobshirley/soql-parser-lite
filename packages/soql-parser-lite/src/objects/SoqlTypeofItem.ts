import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlField } from './SoqlField.js'

/**
 * One `WHEN <objectType> THEN <fields>` branch of a TYPEOF clause.
 */
export class SoqlTypeofWhen extends SoqlBase {
    objectType: string
    fields: SoqlField[]

    constructor(options: { objectType: string; fields: SoqlField[] }) {
        super()
        this.objectType = options.objectType
        this.fields = options.fields
    }
}

/**
 * A `TYPEOF <relationship> WHEN ... THEN ... [ELSE ...] END` select item for
 * polymorphic relationship fields, e.g.
 * `TYPEOF What WHEN Account THEN Phone ELSE Name END`.
 */
export class SoqlTypeofItem extends SoqlBase {
    field: string
    whens: SoqlTypeofWhen[]
    elseFields?: SoqlField[]

    constructor(options: {
        field: string
        whens: SoqlTypeofWhen[]
        elseFields?: SoqlField[]
    }) {
        super()
        this.field = options.field
        this.whens = options.whens
        if (options.elseFields) this.elseFields = options.elseFields
    }

    static fromString(string: string): SoqlTypeofItem {
        return SoqlTypeofItem.fromBuffer(new SoqlStringBuffer(string))
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlTypeofItem {
        SoqlTypeofItem.expectWord(buffer, 'TYPEOF')

        const field = buffer.readString()
        if (!field) {
            throw new SoqlParserError('Expected a field name after TYPEOF')
        }

        const whens: SoqlTypeofWhen[] = []
        let elseFields: SoqlField[] | undefined = undefined

        while (buffer.peekString().toUpperCase() === 'WHEN') {
            buffer.readString() // WHEN
            const objectType = buffer.readString()
            if (!objectType) {
                throw new SoqlParserError('Expected an object type after WHEN')
            }
            SoqlTypeofItem.expectWord(buffer, 'THEN')
            whens.push(
                new SoqlTypeofWhen({
                    objectType,
                    fields: SoqlTypeofItem.readFields(buffer),
                }),
            )
        }

        if (whens.length === 0) {
            throw new SoqlParserError(
                'TYPEOF requires at least one WHEN clause',
            )
        }

        if (buffer.peekString().toUpperCase() === 'ELSE') {
            buffer.readString() // ELSE
            elseFields = SoqlTypeofItem.readFields(buffer)
        }

        SoqlTypeofItem.expectWord(buffer, 'END')

        return new SoqlTypeofItem({ field, whens, elseFields })
    }

    private static expectWord(buffer: SoqlStringBuffer, word: string): void {
        const found = buffer.readString()
        if (found.toUpperCase() !== word) {
            throw new SoqlParserError(
                `Expected ${word} in TYPEOF, got: ${found || 'end of input'}`,
            )
        }
    }

    private static readFields(buffer: SoqlStringBuffer): SoqlField[] {
        const fields: SoqlField[] = []
        while (true) {
            buffer.skipWhitespace()
            const name = buffer.readString()
            if (!name) {
                throw new SoqlParserError('Expected a field name in TYPEOF')
            }
            fields.push(new SoqlField(name))
            buffer.skipWhitespace()
            if (buffer.peek() === BYTE_MAP.comma) {
                buffer.expect(BYTE_MAP.comma)
            } else {
                return fields
            }
        }
    }
}
