import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'

export class SoqlFromObject extends SoqlBase {
    name: string
    alias?: string

    constructor(options: { name: string; alias?: string }) {
        super()
        this.name = options.name

        if (options.alias) this.alias = options.alias
    }

    static fromString(string: string): SoqlFromObject {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlFromObject.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlFromObject {
        const objectName = buffer.readString()

        buffer.skipWhitespace()
        let alias: string | undefined = undefined
        const possibleKeyword = buffer.peekKeyword()
        if (!possibleKeyword) {
            alias = buffer.readString()
        }

        return new SoqlFromObject({ name: objectName, alias })
    }
}
