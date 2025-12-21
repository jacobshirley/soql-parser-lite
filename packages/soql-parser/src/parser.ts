import { ByteBuffer } from './byte-buffer.js'
import { SoqlParserError } from './errors.js'
import {
    BooleanExpr,
    ByteStream,
    DATE_LITERALS,
    DATE_LITERALS_DYNAMIC,
    FieldSelect,
    FieldPath,
    FromClause,
    FromObject,
    GroupByClause,
    HavingClause,
    OPERATORS,
    OrderByClause,
    OrderByField,
    SelectClause,
    SelectItem,
    SoqlQuery,
    ValueExpr,
    WhereClause,
} from './types.js'

/**
 * Mapping of commonly used characters to their byte values for efficient parsing.
 * @internal
 */
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
    g: 0x67,
    G: 0x47,
    i: 0x69,
    I: 0x49,
    p: 0x70,
    P: 0x50,
    u: 0x75,
    U: 0x55,
    v: 0x76,
    V: 0x56,
    b: 0x62,
    B: 0x42,
    y: 0x79,
    Y: 0x59,
}

/**
 * List of all valid SOQL keywords recognized by the parser.
 * @internal
 */
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
    'ORDER',
    'BY',
    'OFFSET',
] as const

/**
 * Valid SOQL keywords that can be used in queries.
 */
export type SoqlKeyword = (typeof SOQL_KEYWORDS)[number]

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

/**
 * Base class for all SOQL parsers. Provides common functionality for parsing SOQL queries
 * including buffer management, whitespace handling, and keyword recognition.
 *
 * @typeParam T - The type of value this parser produces
 * @typeParam Next - The type of parser that can follow this one in the parsing chain
 */
export abstract class SoqlBaseParser<
    T = unknown,
    Next extends SoqlBaseParser | null = SoqlBaseParser<unknown, any> | null,
> {
    /** Indicates whether this parser has been consumed and produced a result */
    consumed: boolean = false
    /** Internal buffer for managing byte-level input */
    protected buffer: ByteBuffer

    /**
     * Creates a new parser instance.
     *
     * @param buffer - Optional buffer or byte stream to parse from
     */
    constructor(buffer?: ByteBuffer | ByteStream) {
        this.buffer =
            buffer instanceof ByteBuffer ? buffer : new ByteBuffer(buffer)
    }

    /**
     * Sets whether the end of file has been reached.
     */
    set eof(value: boolean) {
        this.buffer.eof = value
    }

    /**
     * Gets whether the end of file has been reached.
     */
    get eof(): boolean {
        return this.buffer.eof
    }

    /**
     * Feeds input data into the parser buffer.
     *
     * @param bytes - Input data as numbers, strings, or Uint8Arrays
     */
    feed(...bytes: (number | string | Uint8Array)[]): void {
        this.buffer.feed(...bytes)
    }

    /**
     * Reads and returns the parsed result.
     *
     * @returns The parsed value
     * @throws SoqlParserError if the parser has already been consumed
     */
    read(): T {
        if (this.consumed) {
            throw new SoqlParserError('Parser has already been consumed')
        }
        const parsed = this.parse()
        this.consumed = true
        return parsed
    }

    /**
     * Internal method that performs the actual parsing logic.
     * Must be implemented by subclasses.
     *
     * @returns The parsed value
     */
    protected abstract parse(): T

    /**
     * Returns the next parser in the parsing chain.
     * Must be implemented by subclasses.
     *
     * @returns The next parser or null if parsing is complete
     */
    abstract next(): Next

    /**
     * Skips whitespace characters in the buffer.
     */
    protected skipWhitespace(): void {
        while (isWhitespace(this.buffer.peek())) {
            this.buffer.next()
        }
    }

    /**
     * Peeks ahead at the next string token without consuming it.
     *
     * @returns The next string token in the buffer
     */
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

    /**
     * Peeks ahead at the next SOQL keyword without consuming it.
     *
     * @returns The next keyword if valid, null otherwise
     */
    protected peekKeyword(): SoqlKeyword | null {
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

    /**
     * Reads and consumes the next SOQL keyword from the buffer.
     *
     * @returns The consumed keyword
     * @throws SoqlParserError if the next token is not a valid keyword
     */
    protected readKeyword(): SoqlKeyword {
        const word = this.readString().toUpperCase()
        if (!SOQL_KEYWORDS.includes(word as any)) {
            throw new SoqlParserError(`Expected SOQL keyword, got: ${word}`)
        }
        return word as SoqlKeyword
    }
}

/**
 * Parser for boolean expressions in WHERE and HAVING clauses.
 * Handles comparison operators, logical operators (AND/OR), and parenthesized expressions.
 *
 * @example
 * ```typescript
 * const parser = new SoqlBooleanExprParser('Age > 25 AND Status = "Active"');
 * parser.eof = true;
 * const expr = parser.read();
 * ```
 */
export class SoqlBooleanExprParser extends SoqlBaseParser<
    BooleanExpr,
    SoqlBooleanExprParser
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

        // Check if next word is a SOQL keyword - if so, stop parsing
        const peekedKeyword = this.peekKeyword()
        if (
            peekedKeyword &&
            ['GROUP', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET'].includes(
                peekedKeyword,
            )
        ) {
            return left
        }

        if (peekedKeyword === 'AND') {
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
        } else if (peekedKeyword === 'OR') {
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

    /**
     * Parses a parenthesized boolean expression.
     *
     * @returns A paren expression wrapping the inner boolean expression
     * @private
     */
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

    /**
     * Parses a single value expression (literal, bind variable, or date literal).
     * Handles strings, numbers, booleans, dates, datetimes, null, bind variables, and date literals.
     *
     * @returns The parsed value expression
     * @throws SoqlParserError if the value expression is unrecognized
     * @private
     */
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

    /**
     * Parses a value expression which can be a single value, an array of values, or a subquery.
     * Used in WHERE and HAVING clauses for comparison operators.
     *
     * @returns A single value, an array of values for IN operator, or a subquery
     * @private
     */
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

    /**
     * Parses a comparison expression (field operator value).
     * Handles both simple comparisons and IN expressions.
     *
     * @returns A comparison or IN expression
     * @throws SoqlParserError if the operator is unrecognized or misused
     * @private
     */
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

    next(): SoqlBooleanExprParser {
        if (!this.consumed) {
            this.read()
        }

        return new SoqlBooleanExprParser(this.buffer)
    }
}

/**
 * Parser for individual objects in the FROM clause.
 * Handles object names and optional aliases.
 */
export class SoqlFromObjectParser extends SoqlBaseParser<
    FromObject,
    | SoqlFromObjectParser
    | SoqlWhereClauseParser
    | SoqlGroupByClauseParser
    | SoqlOrderByClauseParser
    | SoqlLimitClauseParser
    | SoqlOffsetClauseParser
    | null
> {
    protected parse(): FromObject {
        this.skipWhitespace()

        const objectName = this.readString()

        this.skipWhitespace()
        const peekedKeyword = this.peekKeyword()

        const fromObject: FromObject = {
            name: objectName,
        }

        if (!peekedKeyword) {
            // Alias detected
            const aliasString = this.readString()
            if (aliasString) {
                fromObject.alias = aliasString
            }
        }
        return fromObject
    }

    next():
        | SoqlFromObjectParser
        | SoqlWhereClauseParser
        | SoqlGroupByClauseParser
        | SoqlOrderByClauseParser
        | SoqlLimitClauseParser
        | SoqlOffsetClauseParser
        | null {
        if (!this.consumed) {
            this.read()
        }

        if (this.buffer.peek() === BYTE_MAP.comma) {
            this.buffer.next() // consume comma or whitespace after object name
            return new SoqlFromObjectParser(this.buffer)
        }

        const peekedKeyword = this.peekKeyword()
        if (!peekedKeyword) {
            return null
        }

        switch (peekedKeyword) {
            case 'WHERE':
                return new SoqlWhereClauseParser(this.buffer)
            case 'GROUP':
                return new SoqlGroupByClauseParser(this.buffer)
            case 'ORDER':
                return new SoqlOrderByClauseParser(this.buffer)
            case 'LIMIT':
                return new SoqlLimitClauseParser(this.buffer)
            case 'OFFSET':
                return new SoqlOffsetClauseParser(this.buffer)
            default:
                return null
        }
    }
}

/**
 * Parser for the FROM clause of a SOQL query.
 * Handles one or more object names with optional aliases.
 *
 * @example
 * ```typescript
 * const parser = new SoqlFromClauseParser('FROM Account a, Contact c');
 * parser.eof = true;
 * const fromClause = parser.read();
 * ```
 */
export class SoqlFromClauseParser extends SoqlBaseParser<
    FromClause,
    | SoqlFromObjectParser
    | SoqlWhereClauseParser
    | SoqlGroupByClauseParser
    | SoqlOrderByClauseParser
    | SoqlLimitClauseParser
    | SoqlOffsetClauseParser
    | null
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

    next():
        | SoqlFromObjectParser
        | SoqlWhereClauseParser
        | SoqlGroupByClauseParser
        | SoqlOrderByClauseParser
        | SoqlLimitClauseParser
        | SoqlOffsetClauseParser
        | null {
        if (this.consumed) {
            const peekedKeyword = this.peekKeyword()
            if (!peekedKeyword) {
                return null
            }

            switch (peekedKeyword) {
                case 'WHERE':
                    return new SoqlWhereClauseParser(this.buffer)
                case 'GROUP':
                    return new SoqlGroupByClauseParser(this.buffer)
                case 'ORDER':
                    return new SoqlOrderByClauseParser(this.buffer)
                case 'LIMIT':
                    return new SoqlLimitClauseParser(this.buffer)
                case 'OFFSET':
                    return new SoqlOffsetClauseParser(this.buffer)
                default:
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

/**
 * Parser for the WHERE clause of a SOQL query.
 * Delegates to a boolean expression parser for the actual condition parsing.
 */
export class SoqlWhereClauseParser extends SoqlBaseParser<
    WhereClause,
    | SoqlBooleanExprParser
    | SoqlGroupByClauseParser
    | SoqlOrderByClauseParser
    | SoqlLimitClauseParser
    | SoqlOffsetClauseParser
    | null
> {
    protected parse(): WhereClause {
        const booleanExprParser = this.next()
        if (!(booleanExprParser instanceof SoqlBooleanExprParser)) {
            throw new SoqlParserError('Expected boolean expression parser')
        }
        return {
            expr: booleanExprParser.read(),
        }
    }

    next():
        | SoqlBooleanExprParser
        | SoqlGroupByClauseParser
        | SoqlOrderByClauseParser
        | SoqlLimitClauseParser
        | SoqlOffsetClauseParser
        | null {
        if (this.consumed) {
            this.skipWhitespace()
            const keyword = this.peekKeyword()
            if (!keyword) return null

            switch (keyword) {
                case 'GROUP':
                    return new SoqlGroupByClauseParser(this.buffer)
                case 'ORDER':
                    return new SoqlOrderByClauseParser(this.buffer)
                case 'LIMIT':
                    return new SoqlLimitClauseParser(this.buffer)
                case 'OFFSET':
                    return new SoqlOffsetClauseParser(this.buffer)
                default:
                    return null
            }
        }

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

/**
 * Parser for the GROUP BY clause of a SOQL query.
 * Handles grouping by one or more fields.
 */
export class SoqlGroupByClauseParser extends SoqlBaseParser<
    GroupByClause,
    | SoqlHavingClauseParser
    | SoqlOrderByClauseParser
    | SoqlLimitClauseParser
    | SoqlOffsetClauseParser
    | null
> {
    protected parse(): GroupByClause {
        this.skipWhitespace()

        this.buffer.expect(BYTE_MAP.g, BYTE_MAP.G) // consume g
        this.buffer.expect(BYTE_MAP.r, BYTE_MAP.R) // consume r
        this.buffer.expect(BYTE_MAP.o, BYTE_MAP.O) // consume o
        this.buffer.expect(BYTE_MAP.u, BYTE_MAP.U) // consume u
        this.buffer.expect(BYTE_MAP.p, BYTE_MAP.P) // consume p
        this.skipWhitespace()
        this.buffer.expect(BYTE_MAP.b, BYTE_MAP.B) // consume b
        this.buffer.expect(BYTE_MAP.y, BYTE_MAP.Y) // consume y
        this.skipWhitespace()

        const fields: FieldPath[] = []

        while (true) {
            const fieldString = this.readString()
            fields.push({ parts: fieldString.split('.') })

            this.skipWhitespace()
            if (this.buffer.peek() === BYTE_MAP.comma) {
                this.buffer.next() // consume comma
                this.skipWhitespace()
            } else {
                break
            }
        }

        return { fields }
    }

    next():
        | SoqlHavingClauseParser
        | SoqlOrderByClauseParser
        | SoqlLimitClauseParser
        | SoqlOffsetClauseParser
        | null {
        if (!this.consumed) {
            this.read()
        }

        this.skipWhitespace()
        const keyword = this.peekKeyword()
        if (!keyword) return null

        switch (keyword) {
            case 'HAVING':
                return new SoqlHavingClauseParser(this.buffer)
            case 'ORDER':
                return new SoqlOrderByClauseParser(this.buffer)
            case 'LIMIT':
                return new SoqlLimitClauseParser(this.buffer)
            case 'OFFSET':
                return new SoqlOffsetClauseParser(this.buffer)
            default:
                return null
        }
    }
}

/**
 * Parser for the HAVING clause of a SOQL query.
 * Used to filter aggregated results in GROUP BY queries.
 */
export class SoqlHavingClauseParser extends SoqlBaseParser<
    HavingClause,
    | SoqlBooleanExprParser
    | SoqlOrderByClauseParser
    | SoqlLimitClauseParser
    | SoqlOffsetClauseParser
    | null
> {
    protected parse(): HavingClause {
        const booleanExprParser = this.next()
        if (!(booleanExprParser instanceof SoqlBooleanExprParser)) {
            throw new SoqlParserError('Expected boolean expression parser')
        }
        return {
            expr: booleanExprParser.read(),
        }
    }

    next():
        | SoqlBooleanExprParser
        | SoqlOrderByClauseParser
        | SoqlLimitClauseParser
        | SoqlOffsetClauseParser
        | null {
        if (this.consumed) {
            this.skipWhitespace()
            const keyword = this.peekKeyword()
            if (!keyword) return null

            switch (keyword) {
                case 'ORDER':
                    return new SoqlOrderByClauseParser(this.buffer)
                case 'LIMIT':
                    return new SoqlLimitClauseParser(this.buffer)
                case 'OFFSET':
                    return new SoqlOffsetClauseParser(this.buffer)
                default:
                    return null
            }
        }

        this.skipWhitespace()

        this.buffer.expect(BYTE_MAP.h, BYTE_MAP.H) // consume h
        this.buffer.expect(BYTE_MAP.a, BYTE_MAP.A) // consume a
        this.buffer.expect(BYTE_MAP.v, BYTE_MAP.V) // consume v
        this.buffer.expect(BYTE_MAP.i, BYTE_MAP.I) // consume i
        this.buffer.expect(BYTE_MAP.n, BYTE_MAP.N) // consume n
        this.buffer.expect(BYTE_MAP.g, BYTE_MAP.G) // consume g

        this.skipWhitespace()

        return new SoqlBooleanExprParser(this.buffer)
    }
}

/**
 * Parser for the ORDER BY clause of a SOQL query.
 * Handles sorting by one or more fields with optional ASC/DESC direction.
 */
export class SoqlOrderByClauseParser extends SoqlBaseParser<
    OrderByClause,
    SoqlLimitClauseParser | SoqlOffsetClauseParser | null
> {
    protected parse(): OrderByClause {
        this.skipWhitespace()

        this.buffer.expect(BYTE_MAP.o, BYTE_MAP.O) // consume o
        this.buffer.expect(BYTE_MAP.r, BYTE_MAP.R) // consume r
        this.buffer.expect(BYTE_MAP.d, BYTE_MAP.D) // consume d
        this.buffer.expect(BYTE_MAP.e, BYTE_MAP.E) // consume e
        this.buffer.expect(BYTE_MAP.r, BYTE_MAP.R) // consume r
        this.skipWhitespace()
        this.buffer.expect(BYTE_MAP.b, BYTE_MAP.B) // consume b
        this.buffer.expect(BYTE_MAP.y, BYTE_MAP.Y) // consume y
        this.skipWhitespace()

        const fields: OrderByField[] = []

        while (true) {
            const fieldString = this.readString()
            const field: FieldPath = { parts: fieldString.split('.') }

            this.skipWhitespace()
            const directionString = this.peekKeyword()
            let direction: 'ASC' | 'DESC' = 'ASC'

            if (directionString === 'ASC' || directionString === 'DESC') {
                this.readKeyword() // consume direction
                direction = directionString as 'ASC' | 'DESC'
            }

            fields.push({ field, direction })

            this.skipWhitespace()
            if (this.buffer.peek() === BYTE_MAP.comma) {
                this.buffer.next() // consume comma
                this.skipWhitespace()
            } else {
                break
            }
        }

        return { fields }
    }

    next(): SoqlLimitClauseParser | SoqlOffsetClauseParser | null {
        if (!this.consumed) {
            this.read()
        }

        this.skipWhitespace()
        const keyword = this.peekKeyword()
        if (!keyword) return null

        switch (keyword) {
            case 'LIMIT':
                return new SoqlLimitClauseParser(this.buffer)
            case 'OFFSET':
                return new SoqlOffsetClauseParser(this.buffer)
            default:
                return null
        }
    }
}

/**
 * Parser for the LIMIT clause of a SOQL query.
 * Restricts the number of results returned.
 */
export class SoqlLimitClauseParser extends SoqlBaseParser<
    number,
    SoqlOffsetClauseParser | null
> {
    protected parse(): number {
        this.skipWhitespace()

        this.buffer.expect(BYTE_MAP.l, BYTE_MAP.L) // consume l
        this.buffer.expect(BYTE_MAP.i, BYTE_MAP.I) // consume i
        this.buffer.expect(BYTE_MAP.m, BYTE_MAP.M) // consume m
        this.buffer.expect(BYTE_MAP.i, BYTE_MAP.I) // consume i
        this.buffer.expect(BYTE_MAP.t, BYTE_MAP.T) // consume t
        this.skipWhitespace()

        const limitString = this.readString()
        const limit = Number(limitString)

        if (isNaN(limit)) {
            throw new SoqlParserError(`Invalid LIMIT value: ${limitString}`)
        }

        return limit
    }

    next(): SoqlOffsetClauseParser | null {
        if (!this.consumed) {
            this.read()
        }
        this.skipWhitespace()
        const keyword = this.peekKeyword()
        if (keyword === 'OFFSET') {
            return new SoqlOffsetClauseParser(this.buffer)
        }
        return null
    }
}

/**
 * Parser for the OFFSET clause of a SOQL query.
 * Specifies how many rows to skip before returning results.
 */
export class SoqlOffsetClauseParser extends SoqlBaseParser<number, null> {
    protected parse(): number {
        this.skipWhitespace()

        this.buffer.expect(BYTE_MAP.o, BYTE_MAP.O) // consume o
        this.buffer.expect(BYTE_MAP.f, BYTE_MAP.F) // consume f
        this.buffer.expect(BYTE_MAP.f, BYTE_MAP.F) // consume f
        this.buffer.expect(BYTE_MAP.s, BYTE_MAP.S) // consume s
        this.buffer.expect(BYTE_MAP.e, BYTE_MAP.E) // consume e
        this.buffer.expect(BYTE_MAP.t, BYTE_MAP.T) // consume t
        this.skipWhitespace()

        const offsetString = this.readString()
        const offset = Number(offsetString)

        if (isNaN(offset)) {
            throw new SoqlParserError(`Invalid OFFSET value: ${offsetString}`)
        }

        return offset
    }

    next(): null {
        if (!this.consumed) {
            this.read()
        }
        return null
    }
}

/**
 * Parser for individual items in the SELECT clause.
 * Handles fields, aggregate functions, and subqueries with optional aliases.
 */
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
            this.skipWhitespace()
            this.buffer.expect(BYTE_MAP.closeParen)

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
            const peekedKeyword = this.peekKeyword()

            if (!peekedKeyword) {
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
        } else if (this.peekKeyword() === 'FROM') {
            return new SoqlFromClauseParser(this.buffer)
        } else {
            throw new SoqlParserError('No more select items to parse')
        }
    }
}

/**
 * Parser for the SELECT clause of a SOQL query.
 * Handles parsing of field selections, aggregate functions, and subqueries.
 */
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

/**
 * Main parser for complete SOQL queries.
 * Orchestrates parsing of all clauses (SELECT, FROM, WHERE, GROUP BY, etc.).
 *
 * @example
 * ```typescript
 * const parser = new SoqlQueryParser('SELECT Id, Name FROM Account WHERE Status = "Active" LIMIT 10');
 * parser.eof = true;
 * const query = parser.read();
 * ```
 */
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
        let groupBy: GroupByClause | undefined = undefined
        let having: HavingClause | undefined = undefined
        let orderBy: OrderByClause | undefined = undefined
        let limit: number | undefined = undefined
        let offset: number | undefined = undefined

        // Process optional clauses using parser chaining
        if (next instanceof SoqlWhereClauseParser) {
            where = next.read()
            next = next.next()
        }

        if (next instanceof SoqlGroupByClauseParser) {
            groupBy = next.read()
            next = next.next()
        }

        if (next instanceof SoqlHavingClauseParser) {
            having = next.read()
            next = next.next()
        }

        if (next instanceof SoqlOrderByClauseParser) {
            orderBy = next.read()
            next = next.next()
        }

        if (next instanceof SoqlLimitClauseParser) {
            limit = next.read()
            next = next.next()
        }

        if (next instanceof SoqlOffsetClauseParser) {
            offset = next.read()
        }

        return {
            type: 'soqlQuery',
            select: select,
            from: fromClause,
            where: where,
            groupBy: groupBy,
            having: having,
            orderBy: orderBy,
            limit: limit,
            offset: offset,
        }
    }

    next(): SoqlSelectParser {
        return new SoqlSelectParser(this.buffer)
    }
}
