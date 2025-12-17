import { ByteBuffer } from './byte-buffer'
import {
    BooleanExpr,
    ByteStream,
    DATE_LITERALS,
    DATE_LITERALS_DYNAMIC,
    FieldSelect,
    OPERATORS,
    SoqlQuery,
    ValueExpr,
    WhereClause,
} from './types'

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
    openParen: 0x28,
    closeParen: 0x29,
    a: 0x61,
    A: 0x41,
    n: 0x6e,
    N: 0x4e,
    d: 0x64,
    D: 0x44,
    o: 0x6f,
    O: 0x4f,
    r: 0x72,
    R: 0x52,
    s: 0x73,
    S: 0x53,
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

export abstract class SoqlBaseParser<
    T = unknown,
    Next extends SoqlBaseParser = SoqlBaseParser<unknown, any>,
> {
    consumed: boolean = false
    protected buffer: ByteBuffer

    constructor(buffer?: ByteBuffer | ByteStream) {
        this.buffer =
            buffer instanceof ByteBuffer ? buffer : new ByteBuffer(buffer)
    }

    set eof(value: boolean) {
        this.buffer.eof = value
    }

    get eof(): boolean {
        return this.buffer.eof
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

export class SoqlBooleanExprParser extends SoqlBaseParser<
    BooleanExpr,
    SoqlWhereClauseParser
> {
    protected parse(): BooleanExpr {
        this.skipWhitespace()

        let left: BooleanExpr

        if (this.buffer.peek() === BYTE_MAP.openParen) {
            left = this.parseParenExpr()
        } else {
            left = this.parseComparisonExpr()
        }

        this.skipWhitespace()

        const nextByte = this.buffer.peek()
        if (nextByte === null) {
            return left
        } else if (nextByte === BYTE_MAP.a || nextByte === BYTE_MAP.A) {
            // Expecting AND
            this.buffer.expect(BYTE_MAP.a, BYTE_MAP.A) // consume 'a'
            this.buffer.expect(BYTE_MAP.n, BYTE_MAP.N) // consume 'n'
            this.buffer.expect(BYTE_MAP.d, BYTE_MAP.D) // consume 'd'
            this.skipWhitespace()
            const rightParser = new SoqlBooleanExprParser(this.buffer)
            const right = rightParser.read()

            return {
                type: 'logical',
                operator: 'AND',
                left: left,
                right: right,
            }
        } else if (nextByte === BYTE_MAP.o || nextByte === BYTE_MAP.O) {
            // Expecting OR
            this.buffer.expect(BYTE_MAP.o, BYTE_MAP.O) // consume 'o'
            this.buffer.expect(BYTE_MAP.r, BYTE_MAP.R) // consume 'r'
            this.skipWhitespace()
            const rightParser = new SoqlBooleanExprParser(this.buffer)
            const right = rightParser.read()

            return {
                type: 'logical',
                operator: 'OR',
                left: left,
                right: right,
            }
        } else {
            return left
        }
    }

    private parseParenExpr(): BooleanExpr {
        this.buffer.expect(BYTE_MAP.openParen)
        this.skipWhitespace()

        const exprParser = new SoqlBooleanExprParser(this.buffer)
        const expr = exprParser.read()

        this.skipWhitespace()
        this.buffer.expect(BYTE_MAP.closeParen)

        return {
            type: 'paren',
            expr: expr,
        }
    }

    private parseSingleValueExpr(): ValueExpr {
        let valueString = ''

        while (
            !isWhitespace(this.buffer.peek()) &&
            this.buffer.peek() !== BYTE_MAP.closeParen
        ) {
            const curr = this.buffer.next()
            valueString += String.fromCharCode(curr)
        }

        let expr: ValueExpr
        if (valueString.startsWith("'") && valueString.endsWith("'")) {
            expr = {
                type: 'string',
                value: valueString.slice(1, -1),
            }
        } else if (!isNaN(Number(valueString))) {
            expr = {
                type: 'number',
                value: Number(valueString),
            }
        } else if (
            valueString.toLowerCase() === 'true' ||
            valueString.toLowerCase() === 'false'
        ) {
            expr = {
                type: 'boolean',
                value: valueString.toLowerCase() === 'true',
            }
        } else if (valueString.toLowerCase() === 'null') {
            expr = {
                type: 'null',
                value: null,
            }
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(valueString)) {
            expr = {
                type: 'date',
                value: valueString,
            }
        } else if (
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(valueString)
        ) {
            expr = {
                type: 'datetime',
                value: valueString,
            }
        } else if (valueString.startsWith(':')) {
            expr = {
                type: 'bindVariable',
                name: valueString.slice(1),
            }
        } else if (DATE_LITERALS.includes(valueString as any)) {
            expr = {
                type: 'dateLiteral',
                value: valueString as any,
            }
        } else if (
            DATE_LITERALS_DYNAMIC.some((prefix) =>
                valueString.startsWith(prefix),
            )
        ) {
            const [literalType, nStr] = valueString.split(':')
            const n = Number(nStr)
            if (isNaN(n)) {
                throw new SoqlParserError(
                    `Invalid number in date literal: ${valueString}`,
                )
            }
            expr = {
                type: 'dateLiteral',
                value: {
                    type: literalType as any,
                    n: n,
                },
            }
        } else {
            throw new SoqlParserError(
                `Unrecognized value expression: ${valueString}`,
            )
        }

        return expr
    }

    private parseValueExpr(): ValueExpr | ValueExpr[] | SoqlQuery {
        this.skipWhitespace()

        if (this.buffer.peek() === BYTE_MAP.openParen) {
            this.buffer.expect(BYTE_MAP.openParen) // consume '('
            this.skipWhitespace()

            if (
                this.buffer.peek() === BYTE_MAP.s ||
                this.buffer.peek() === BYTE_MAP.S
            ) {
                const soqlParser = new SoqlQueryParser(this.buffer)
                return soqlParser.read()
            }

            const values: ValueExpr[] = []
            while (this.buffer.peek() !== BYTE_MAP.closeParen) {
                this.skipWhitespace()
                const valueExpr = this.parseSingleValueExpr()
                values.push(valueExpr)
                this.skipWhitespace()
            }
            this.buffer.expect(BYTE_MAP.closeParen)

            return values
        } else {
            return this.parseSingleValueExpr()
        }
    }

    private parseComparisonExpr(): BooleanExpr {
        const fieldParser = new SoqlFieldSelectParser(this.buffer)
        const field = fieldParser.read()

        this.skipWhitespace()

        let operator = ''
        while (
            this.buffer.peek() !== null &&
            !isWhitespace(this.buffer.peek())
        ) {
            const curr = this.buffer.next()
            operator += String.fromCharCode(curr)
        }

        if (!OPERATORS.includes(operator as any)) {
            throw new SoqlParserError(
                `Unrecognized operator in comparison expression: ${operator}`,
            )
        }

        this.skipWhitespace()
        const rightExpr = this.parseValueExpr()

        if (
            Array.isArray(rightExpr) ||
            ('type' in rightExpr && rightExpr.type === 'soqlQuery')
        ) {
            if (operator !== 'in') {
                throw new SoqlParserError(
                    `Operator '${operator}' cannot be used with multiple values or subquery`,
                )
            }
        }

        return {
            type: 'comparison',
            left: field.fieldName,
            operator: operator as any,
            right: rightExpr as ValueExpr,
        }
    }

    next(): SoqlWhereClauseParser {
        if (!this.consumed) {
            this.read()
        }

        throw new SoqlParserError('No more boolean expressions to parse') // TODO: support multiple boolean expressions
    }
}

export class SoqlWhereClauseParser extends SoqlBaseParser<
    WhereClause,
    SoqlBooleanExprParser
> {
    protected parse(): WhereClause {
        return {
            expr: this.next().read(),
        }
    }

    next(): SoqlBooleanExprParser {
        this.skipWhitespace()

        this.buffer.next() // consume w
        this.buffer.next() // consume h
        this.buffer.next() // consume e
        this.buffer.next() // consume r
        this.buffer.next() // consume e

        this.skipWhitespace()

        return new SoqlBooleanExprParser(this.buffer)
    }
}

export class SoqlFieldSelectParser extends SoqlBaseParser<
    FieldSelect,
    SoqlFieldSelectParser
> {
    protected parse(): FieldSelect {
        this.skipWhitespace()

        let fieldString = ''
        while (
            this.buffer.peek() !== BYTE_MAP.comma &&
            !isWhitespace(this.buffer.peek())
        ) {
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

export class SoqlSelectParser extends SoqlBaseParser<
    FieldSelect[],
    SoqlFieldSelectParser
> {
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

export class SoqlQueryParser extends SoqlBaseParser<
    SoqlQuery,
    SoqlWhereClauseParser
> {
    protected parse(): SoqlQuery {
        throw new SoqlParserError('Not implemented yet')
    }

    next(): SoqlWhereClauseParser {
        if (!this.consumed) {
            this.read()
        }
        throw new SoqlParserError('No more query parts to parse') // TODO: support more query parts
    }
}
