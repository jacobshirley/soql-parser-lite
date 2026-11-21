import { ByteBuffer } from '../../byte-buffer.js'
import { BYTE_MAP, isWhitespace } from '../../byte-map.js'
import { SoqlParserError } from '../../errors.js'
import { SOQL_KEYWORDS, SoqlKeyword } from '../../types.js'

/**
 * Bytes that end a word token: whitespace, list/paren punctuation and the
 * comparison-operator symbols (so `Name='x'` and `Amount>5` need no spaces).
 */
function isTokenBoundary(byte: number): boolean {
    return (
        isWhitespace(byte) ||
        byte === BYTE_MAP.comma ||
        byte === BYTE_MAP.openParen ||
        byte === BYTE_MAP.closeParen ||
        isOperatorSymbol(byte)
    )
}

function isOperatorSymbol(byte: number): boolean {
    return (
        byte === BYTE_MAP.equals ||
        byte === BYTE_MAP.exclamation ||
        byte === BYTE_MAP.lessThan ||
        byte === BYTE_MAP.greaterThan
    )
}

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

        while (currByte !== null && !isTokenBoundary(currByte)) {
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

        while (currByte !== null && !isTokenBoundary(currByte)) {
            extractedWord += String.fromCharCode(currByte)
            this.buffer.next()
            currByte = this.buffer.peek()
        }

        return extractedWord
    }

    /**
     * Reads a comparison operator: a symbol operator (`=`, `!=`, `<`, `<=`,
     * `>`, `>=`) which needs no surrounding whitespace, or a word operator
     * such as `LIKE` / `IN`. The result is upper-cased.
     */
    readOperator(): string {
        this.skipWhitespace()

        const first = this.buffer.peek()
        if (first !== null && isOperatorSymbol(first)) {
            let op = String.fromCharCode(this.buffer.next())
            if (this.buffer.peek() === BYTE_MAP.equals) {
                op += String.fromCharCode(this.buffer.next())
            }
            return op
        }

        return this.readString().toUpperCase()
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
