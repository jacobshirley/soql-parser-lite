import { ByteBuffer } from '../byte-buffer'
import { BYTE_MAP, isWhitespace } from '../byte-map'
import { SoqlParserError } from '../errors'
import { SOQL_KEYWORDS, SoqlKeyword } from '../types'

export class SoqlStringBuffer {
    buffer: ByteBuffer

    constructor(value: string) {
        this.buffer = new ByteBuffer(value)
    }

    peek(ahead = 0): number | null {
        return this.buffer.peek(ahead)
    }

    /**
     * Skips whitespace characters in the buffer.
     */
    skipWhitespace(): void {
        while (isWhitespace(this.buffer.peek())) {
            this.buffer.next()
        }
    }

    /**
     * Peeks ahead at the next string token without consuming it.
     *
     * @returns The next string token in the buffer
     */
    peekString(): string {
        this.skipWhitespace()

        let extractedWord = ''
        let offset = 0
        let currByte = this.buffer.peek(offset)

        while (
            currByte !== null &&
            !isWhitespace(currByte) &&
            currByte !== BYTE_MAP.comma
        ) {
            extractedWord += String.fromCharCode(currByte)
            offset++
            currByte = this.buffer.peek(offset)
        }

        return extractedWord
    }

    /**
     * Peeks ahead at the next SOQL keyword without consuming it.
     *
     * @returns The next keyword if valid, null otherwise
     */
    peekKeyword(): SoqlKeyword | null {
        const word = this.peekString().toUpperCase()
        if (!word || !SOQL_KEYWORDS.includes(word as any)) {
            return null
        }
        return word as SoqlKeyword
    }

    /**
     * Reads and consumes the next string token from the buffer.
     *
     * @returns The consumed string token
     */
    readString(): string {
        this.skipWhitespace()

        let extractedWord = ''
        let currByte = this.buffer.peek()

        while (
            currByte !== null &&
            !isWhitespace(currByte) &&
            currByte !== BYTE_MAP.comma &&
            currByte !== BYTE_MAP.openParen &&
            currByte !== BYTE_MAP.closeParen
        ) {
            extractedWord += String.fromCharCode(currByte)
            this.buffer.next()
            currByte = this.buffer.peek()
        }

        return extractedWord
    }

    /**
     * Reads and consumes the next SOQL keyword from the buffer.
     *
     * @returns The consumed keyword
     * @throws SoqlParserError if the next token is not a valid keyword
     */
    readKeyword(): SoqlKeyword {
        const word = this.readString().toUpperCase()
        if (!SOQL_KEYWORDS.includes(word as any)) {
            throw new SoqlParserError(`Expected SOQL keyword, got: ${word}`)
        }
        return word as SoqlKeyword
    }

    expect(...expectedByte: number[]): void {
        this.buffer.expect(...expectedByte)
    }

    tryParse<T>(parser: () => T): T | undefined {
        return this.buffer.resetOnFail(parser, undefined, true)
    }
}

export abstract class SoqlObject {}

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

export class SoqlAggregateField extends SoqlObject {
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

        const field = SoqlField.fromBuffer(buffer)
        buffer.skipWhitespace()
        buffer.expect(BYTE_MAP.closeParen)
        buffer.skipWhitespace()

        return new SoqlAggregateField({ functionName, field })
    }
}

export class SoqlSelectField extends SoqlObject {
    field: SoqlField | SoqlAggregateField
    alias?: string

    constructor(options: {
        field: SoqlField | SoqlAggregateField
        alias?: string
    }) {
        super()
        this.field = options.field

        if (options.alias) this.alias = options.alias
    }

    static fromFieldAndAlias(
        field: SoqlField | SoqlAggregateField,
        alias?: string,
    ): SoqlSelectField {
        return new SoqlSelectField({ field, alias })
    }

    static fromString(string: string): SoqlSelectField {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSelectField.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSelectField {
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

        if (buffer.peek() === BYTE_MAP.comma || buffer.peek() === null) {
            return new SoqlSelectField({ field })
        }

        let alias: string | undefined = undefined
        const possibleKeyword = buffer.peekKeyword()
        if (!possibleKeyword) {
            alias = buffer.readString()
        }

        return new SoqlSelectField({ field, alias })
    }
}

export class SoqlSelectClause extends SoqlObject {
    fields: SoqlSelectField[]

    constructor(fields: SoqlSelectField[]) {
        super()
        this.fields = fields
    }

    static fromString(string: string): SoqlSelectClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSelectClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSelectClause {
        const keyword = buffer.readKeyword()
        if (keyword !== 'SELECT') {
            throw new SoqlParserError(
                `Expected SELECT keyword, got: ${keyword}`,
            )
        }

        buffer.skipWhitespace()
        const fields: SoqlSelectField[] = []

        while (true) {
            const field = SoqlSelectField.fromBuffer(buffer)
            fields.push(field)

            buffer.skipWhitespace()
            const nextByte = buffer.peek()
            if (nextByte === BYTE_MAP.comma) {
                buffer.expect(BYTE_MAP.comma)
                buffer.skipWhitespace()
            } else {
                break
            }
        }

        return new SoqlSelectClause(fields)
    }
}

export class SoqlFromObject extends SoqlObject {
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

export class SoqlFromClause extends SoqlObject {
    objects: SoqlFromObject[]

    constructor(objects: SoqlFromObject[]) {
        super()
        this.objects = objects
    }

    static fromString(string: string): SoqlFromClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlFromClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlFromClause {
        const keyword = buffer.readKeyword()
        if (keyword !== 'FROM') {
            throw new SoqlParserError(`Expected FROM keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        const objects: SoqlFromObject[] = []

        while (true) {
            const fromObject = SoqlFromObject.fromBuffer(buffer)
            objects.push(fromObject)

            buffer.skipWhitespace()
            const nextByte = buffer.peek()
            if (nextByte === BYTE_MAP.comma) {
                buffer.expect(BYTE_MAP.comma)
                buffer.skipWhitespace()
            } else {
                break
            }
        }

        return new SoqlFromClause(objects)
    }
}
