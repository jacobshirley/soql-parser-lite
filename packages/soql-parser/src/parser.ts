import { ByteBuffer } from "./byte-buffer"
import { ByteStream, FieldSelect, WhereClause } from "./types"

export class SoqlParserError extends Error {
    constructor(message: string) {
        super(`SOQL Parser Error: ${message}`)
        this.name = 'SoqlParserError'
    }
}

const BYTE_MAP = {
    space: 0x20,
    tab: 0x09,
    carriageReturn: 0x0d,
    lineFeed: 0x0a,
    comma: 0x2c,
}

/**
 * Checks if a byte represents a whitespace character.
 *
 * @param byte - The byte to check
 * @returns True if the byte is a space, tab, carriage return, or line feed
 */
const isWhitespace = (byte: number | null): boolean => {
    return (
        byte === BYTE_MAP.space ||
        byte === BYTE_MAP.tab ||
        byte === BYTE_MAP.carriageReturn ||
        byte === BYTE_MAP.lineFeed
    )
}

export abstract class SoqlBaseParser<T = unknown, Next extends SoqlBaseParser = SoqlBaseParser<unknown, any>> {
    consumed: boolean = false
    protected buffer: ByteBuffer

    constructor(buffer?: ByteBuffer | ByteStream) {
        this.buffer =
            buffer instanceof ByteBuffer ? buffer : new ByteBuffer(buffer)
    }

    feed(...bytes: (number | string | Uint8Array)[]): void {
        this.buffer.feed(...bytes)
    }

    read(): T {
        if (this.consumed) {
            throw new SoqlParserError('Parser has already been consumed')
        }
        this.consumed = true
        return this.parse()
    }

    protected abstract parse(): T

    abstract next(): Next

     /**
     * Skips whitespace characters in the buffer.
     */
    protected skipWhitespace(): void {
        while (isWhitespace(this.buffer.peek())) {
            this.buffer.next()
        }
    }
}

export class SoqlFieldSelectParser extends SoqlBaseParser<FieldSelect, SoqlFieldSelectParser> {
    protected parse(): FieldSelect {
        this.skipWhitespace()

        let fieldString = ''
        while (this.buffer.peek() !== BYTE_MAP.comma && !isWhitespace(this.buffer.peek())) {
            const curr = this.buffer.next()
            fieldString += String.fromCharCode(curr)
        }

        return {
            type: 'field',
            fieldName: { parts: fieldString.split('.') },
        }
    }

    next(): SoqlFieldSelectParser {
        if (!this.consumed) {
            this.read()
        }

        if (this.buffer.peek() === BYTE_MAP.comma) {
            this.buffer.next() // consume comma or whitespace after field name
            return new SoqlFieldSelectParser(this.buffer)
        } else {
            throw new SoqlParserError('No more field selects to parse') // TODO: support other select types
        }
    }
}

export class SoqlSelectParser extends SoqlBaseParser<FieldSelect[], SoqlFieldSelectParser> {
    protected parse(): FieldSelect[] {
        const values: FieldSelect[] = []
        let next = this.next()
        while (next instanceof SoqlFieldSelectParser) {
            const fieldSelect = next.read()
            values.push(fieldSelect)
            try {
                next = next.next()
            } catch {
                break
            }
        }
        return values
    }

    next(): SoqlFieldSelectParser {
        this.skipWhitespace()
        this.buffer.next() // consume s
        this.buffer.next() // consume e
        this.buffer.next() // consume l
        this.buffer.next() // consume e
        this.buffer.next() // consume c
        this.buffer.next() // consume t
        this.skipWhitespace()
        
        return new SoqlFieldSelectParser(this.buffer)
    }
}