import { ByteBuffer } from './byte-buffer'
import {
    AggregateSelect,
    BooleanExpr,
    ByteStream,
    DATE_LITERALS,
    DATE_LITERALS_DYNAMIC,
    FieldSelect,
    FromClause,
    FromObject,
    OPERATORS,
    SelectClause,
    SelectItem,
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
    f: 0x66,
    F: 0x46,
    m: 0x6d,
    M: 0x4d,
    t: 0x74,
    T: 0x54,
    e: 0x65,
    E: 0x45,
    l: 0x6c,
    L: 0x4c,
    c: 0x63,
    C: 0x43,
    w: 0x77,
    W: 0x57,
    h: 0x68,
    H: 0x48,
}

const SOQL_KEYWORDS = [
    'SELECT',
    'FROM',
    'WHERE',
    'AND',
    'OR',
    'IN',
    'LIKE',
    'COUNT',
    'MAX',
    'MIN',
    'SUM',
    'AVG',
    'ASC',
    'DESC',
    'EXCLUDES',
    'FIRST',
    'GROUP',
    'HAVING',
    'INCLUDES',
    'LAST',
    'LIMIT',
    'NOT',
    'NULL',
    'NULLS',
    'USING',
    'WITH',
] as const

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
    Next extends SoqlBaseParser | null = SoqlBaseParser<unknown, any> | null,
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
        const parsed = this.parse()
        this.consumed = true
        return parsed
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

    protected peekString(): string {
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

    protected readString(): string {
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
        const valueString = this.readString()

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
                // Subquery
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
        const fieldString = this.readString()
        const field: FieldSelect = {
            type: 'field',
            fieldName: { parts: fieldString.split('.') },
        }

        this.skipWhitespace()

        const operator =
            this.readString().toLowerCase() as (typeof OPERATORS)[number]

        if (!OPERATORS.includes(operator)) {
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

        if (operator === 'in') {
            return {
                type: 'in',
                left: field.fieldName,
                right: rightExpr as ValueExpr[] | SoqlQuery,
            }
        }

        return {
            type: 'comparison',
            left: field.fieldName,
            operator: operator,
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

export class SoqlFromObjectParser extends SoqlBaseParser<
    FromObject,
    SoqlFromObjectParser | SoqlWhereClauseParser | null
> {
    protected parse(): FromObject {
        this.skipWhitespace()

        const objectName = this.readString()

        this.skipWhitespace()
        const peekedString = this.peekString()
        if (SOQL_KEYWORDS.includes(peekedString as any)) {
            return {
                name: objectName,
            }
        } else {
            // Alias detected
            const aliasString = this.readString()
            return {
                name: objectName,
                alias: aliasString,
            }
        }
    }

    next(): SoqlFromObjectParser | SoqlWhereClauseParser | null {
        if (!this.consumed) {
            this.read()
        }

        if (this.buffer.peek() === BYTE_MAP.comma) {
            this.buffer.next() // consume comma or whitespace after object name
            return new SoqlFromObjectParser(this.buffer)
        } else if (this.peekString().toUpperCase() === 'WHERE') {
            return new SoqlWhereClauseParser(this.buffer)
        } else {
            // TODO: support other clauses like ORDER BY, LIMIT, etc.
            return null
        }
    }
}

export class SoqlFromClauseParser extends SoqlBaseParser<
    FromClause,
    SoqlFromObjectParser | SoqlWhereClauseParser | null
> {
    protected parse(): FromClause {
        const next = this.next()
        const objects: FromObject[] = []

        let currentParser: SoqlBaseParser | null = next
        while (currentParser instanceof SoqlFromObjectParser) {
            const fromObject = currentParser.read()
            objects.push(fromObject)
            currentParser = currentParser.next()
        }

        const fromClause: FromClause = {
            objects: objects,
        }

        return fromClause
    }

    next(): SoqlFromObjectParser | SoqlWhereClauseParser | null {
        if (this.consumed) {
            if (this.peekString().toUpperCase() === 'WHERE') {
                return new SoqlWhereClauseParser(this.buffer)
            } else {
                return null
            }
        } else {
            this.skipWhitespace()
            this.buffer.expect(BYTE_MAP.f, BYTE_MAP.F) // consume f
            this.buffer.expect(BYTE_MAP.r, BYTE_MAP.R) // consume r
            this.buffer.expect(BYTE_MAP.o, BYTE_MAP.O) // consume o
            this.buffer.expect(BYTE_MAP.m, BYTE_MAP.M) // consume m

            return new SoqlFromObjectParser(this.buffer)
        }
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

        this.buffer.expect(BYTE_MAP.w, BYTE_MAP.W) // consume w
        this.buffer.expect(BYTE_MAP.h, BYTE_MAP.H) // consume h
        this.buffer.expect(BYTE_MAP.e, BYTE_MAP.E) // consume e
        this.buffer.expect(BYTE_MAP.r, BYTE_MAP.R) // consume r
        this.buffer.expect(BYTE_MAP.e, BYTE_MAP.E) // consume e

        this.skipWhitespace()

        return new SoqlBooleanExprParser(this.buffer)
    }
}

export class SoqlSelectItemParser extends SoqlBaseParser<
    SelectItem,
    SoqlSelectItemParser | SoqlFromClauseParser
> {
    protected parse(): SelectItem {
        let selectItem: SelectItem

        this.skipWhitespace()

        const nextByte = this.buffer.peek()
        if (nextByte === BYTE_MAP.openParen) {
            // Subquery
            this.buffer.expect(BYTE_MAP.openParen)

            const queryParser = new SoqlQueryParser(this.buffer)
            const subquery = queryParser.read()

            selectItem = {
                type: 'subquery',
                subquery: subquery,
            }
        } else {
            const string1 = this.readString()

            if (this.buffer.peek() === BYTE_MAP.openParen) {
                // Aggregate function

                const functionName = string1.toUpperCase().trim()
                this.buffer.expect(BYTE_MAP.openParen)
                const argumentString = this.readString()
                this.buffer.expect(BYTE_MAP.closeParen)

                selectItem = {
                    type: 'aggregate',
                    functionName: functionName,
                    fieldName: {
                        parts: argumentString.split('.'),
                    },
                }
            } else {
                // Regular field select
                selectItem = {
                    type: 'field',
                    fieldName: { parts: string1.split('.') },
                }
            }

            this.skipWhitespace()
            const peekedString = this.peekString()

            if (!SOQL_KEYWORDS.includes(peekedString as any)) {
                // Alias detected
                const aliasString = this.readString()
                if (aliasString) selectItem.alias = aliasString
            }
        }

        return selectItem
    }

    next(): SoqlSelectItemParser | SoqlFromClauseParser {
        if (!this.consumed) {
            this.read()
        }

        this.skipWhitespace()

        if (this.buffer.peek() === BYTE_MAP.comma) {
            this.buffer.next() // consume comma or whitespace after field name
            return new SoqlSelectItemParser(this.buffer)
        } else if (this.peekString().toUpperCase() === 'FROM') {
            return new SoqlFromClauseParser(this.buffer)
        } else {
            throw new SoqlParserError('No more select items to parse') // TODO: support other options
        }
    }
}

export class SoqlSelectParser extends SoqlBaseParser<
    SelectClause,
    SoqlSelectItemParser | SoqlFromClauseParser
> {
    protected parse(): SelectClause {
        const values: SelectItem[] = []
        let next: SoqlSelectItemParser | SoqlFromClauseParser = this.next()

        while (next instanceof SoqlSelectItemParser) {
            const fieldSelect = next.read()
            values.push(fieldSelect)

            next = next.next()
        }

        return {
            items: values,
        }
    }

    next(): SoqlSelectItemParser | SoqlFromClauseParser {
        if (this.consumed) {
            return new SoqlFromClauseParser(this.buffer)
        }

        this.skipWhitespace()
        this.buffer.expect(BYTE_MAP.s, BYTE_MAP.S) // consume s
        this.buffer.expect(BYTE_MAP.e, BYTE_MAP.E) // consume e
        this.buffer.expect(BYTE_MAP.l, BYTE_MAP.L) // consume l
        this.buffer.expect(BYTE_MAP.e, BYTE_MAP.E) // consume e
        this.buffer.expect(BYTE_MAP.c, BYTE_MAP.C) // consume c
        this.buffer.expect(BYTE_MAP.t, BYTE_MAP.T) // consume t
        this.skipWhitespace()

        return new SoqlSelectItemParser(this.buffer)
    }
}

export class SoqlQueryParser extends SoqlBaseParser<
    SoqlQuery,
    SoqlSelectParser
> {
    protected parse(): SoqlQuery {
        let next: SoqlBaseParser | null = this.next()

        if (!(next instanceof SoqlSelectParser)) {
            throw new SoqlParserError('Expected SELECT clause in SOQL query')
        }

        const select = next.read()

        next = next.next()
        if (!(next instanceof SoqlFromClauseParser)) {
            throw new SoqlParserError(
                'Expected FROM clause in SOQL query but found ' +
                    next.constructor.name,
            )
        }

        const fromClause = next.read()

        next = next.next()

        let where: WhereClause | undefined = undefined
        if (next instanceof SoqlWhereClauseParser) {
            where = next.read()
        }

        return {
            type: 'soqlQuery',
            select: select,
            from: fromClause,
            where: where,
        }
    }

    next(): SoqlSelectParser {
        return new SoqlSelectParser(this.buffer)
    }
}
