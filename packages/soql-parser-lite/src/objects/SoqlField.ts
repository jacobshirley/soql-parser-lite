import { SoqlParserError } from '../errors.js'
import { isValidIdentifier } from '../utils.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'

export class SoqlField extends SoqlBase {
    name: string

    constructor(name: string) {
        super()
        this.name = name
    }

    static fromString(name: string): SoqlField {
        return new SoqlField(SoqlField.validate(name))
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlField {
        const fieldName = buffer.readString()
        return new SoqlField(SoqlField.validate(fieldName))
    }

    private static validate(name: string): string {
        if (!isValidIdentifier(name)) {
            throw new SoqlParserError(
                name === ''
                    ? 'Expected a field name'
                    : `Invalid field name: ${name}`,
            )
        }
        return name
    }
}
