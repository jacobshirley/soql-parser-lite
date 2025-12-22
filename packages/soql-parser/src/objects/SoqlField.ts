import { SoqlObject } from './SoqlObject'
import { SoqlStringBuffer } from './SoqlStringBuffer'

export class SoqlField extends SoqlObject {
    name: string

    constructor(name: string) {
        super()
        this.name = name
    }

    static fromString(name: string): SoqlField {
        return new SoqlField(name)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlField {
        const fieldName = buffer.readString()
        return new SoqlField(fieldName)
    }
}
