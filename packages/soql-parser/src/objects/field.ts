import { ByteBuffer } from '../byte-buffer'
import { BYTE_MAP, isWhitespace } from '../byte-map'
import { SoqlParserError } from '../errors'
import {
    DATE_LITERALS,
    DATE_LITERALS_DYNAMIC,
    OPERATORS,
    SOQL_KEYWORDS,
    SoqlKeyword,
    SoqlOperator,
} from '../types'

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

export abstract class SoqlValueExpr extends SoqlObject {
    static fromString(string: string): SoqlValueExpr {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlValueExpr.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlValueExpr {
        if (
            buffer.peek() === BYTE_MAP.singleQuote ||
            buffer.peek() === BYTE_MAP.doubleQuote
        ) {
            return SoqlStringLiteral.fromBuffer(buffer)
        } else if (buffer.peek() === BYTE_MAP.colon) {
            return SoqlBindVariable.fromBuffer(buffer)
        } else {
            const nextStr = buffer.peekString()
            if (/^[+-]?\d/.test(nextStr)) {
                return SoqlNumberLiteral.fromBuffer(buffer)
            } else if (/^(true|false)/i.test(nextStr)) {
                return SoqlBooleanLiteral.fromBuffer(buffer)
            } else if (
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(nextStr)
            ) {
                return SoqlDateTimeLiteral.fromBuffer(buffer)
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(nextStr)) {
                return SoqlDateValueLiteral.fromBuffer(buffer)
            } else if (DATE_LITERALS.includes(nextStr.toUpperCase() as any)) {
                return SoqlDateLiteral.fromBuffer(buffer)
            } else if (
                DATE_LITERALS_DYNAMIC.some((prefix) =>
                    nextStr.toUpperCase().startsWith(prefix),
                )
            ) {
                return SoqlDateLiteral.fromBuffer(buffer)
            } else if (nextStr.toLowerCase() === 'null') {
                return SoqlNullLiteral.fromBuffer(buffer)
            } else {
                throw new SoqlParserError(
                    `Unrecognized value expression: ${nextStr}`,
                )
            }
        }
    }
}

// ValueExpr classes
export class SoqlStringLiteral extends SoqlValueExpr {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }

    static fromString(value: string): SoqlStringLiteral {
        // Remove quotes if present
        const cleanValue =
            (value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))
                ? value.slice(1, -1)
                : value
        return new SoqlStringLiteral(cleanValue)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlStringLiteral {
        const valueString = buffer.readString()
        if (
            (valueString.startsWith("'") && valueString.endsWith("'")) ||
            (valueString.startsWith('"') && valueString.endsWith('"'))
        ) {
            return new SoqlStringLiteral(valueString.slice(1, -1))
        }
        throw new SoqlParserError(`Invalid string literal: ${valueString}`)
    }
}

export class SoqlNumberLiteral extends SoqlValueExpr {
    value: number

    constructor(value: number) {
        super()
        this.value = value
    }

    static fromString(value: string): SoqlNumberLiteral {
        const numValue = Number(value)
        if (isNaN(numValue)) {
            throw new SoqlParserError(`Invalid number literal: ${value}`)
        }
        return new SoqlNumberLiteral(numValue)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlNumberLiteral {
        const valueString = buffer.readString()
        const numValue = Number(valueString)
        if (!isNaN(numValue)) {
            return new SoqlNumberLiteral(numValue)
        }
        throw new SoqlParserError(`Invalid number literal: ${valueString}`)
    }
}

export class SoqlBooleanLiteral extends SoqlValueExpr {
    value: boolean

    constructor(value: boolean) {
        super()
        this.value = value
    }

    static fromString(value: string): SoqlBooleanLiteral {
        const lowerValue = value.toLowerCase()
        if (lowerValue !== 'true' && lowerValue !== 'false') {
            throw new SoqlParserError(`Invalid boolean literal: ${value}`)
        }
        return new SoqlBooleanLiteral(lowerValue === 'true')
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlBooleanLiteral {
        const valueString = buffer.readString()
        const lowerValue = valueString.toLowerCase()
        if (lowerValue === 'true' || lowerValue === 'false') {
            return new SoqlBooleanLiteral(lowerValue === 'true')
        }
        throw new SoqlParserError(`Invalid boolean literal: ${valueString}`)
    }
}

export class SoqlDateValueLiteral extends SoqlValueExpr {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }

    static fromString(value: string): SoqlDateValueLiteral {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new SoqlParserError(
                `Invalid date literal format (expected YYYY-MM-DD): ${value}`,
            )
        }
        return new SoqlDateValueLiteral(value)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlDateValueLiteral {
        const valueString = buffer.readString()
        if (/^\d{4}-\d{2}-\d{2}$/.test(valueString)) {
            return new SoqlDateValueLiteral(valueString)
        }
        throw new SoqlParserError(
            `Invalid date literal format (expected YYYY-MM-DD): ${valueString}`,
        )
    }
}

export class SoqlDateLiteral extends SoqlValueExpr {
    value:
        | string
        | {
              type: string
              n: number
          }

    constructor(
        value:
            | string
            | {
                  type: string
                  n: number
              },
    ) {
        super()
        this.value = value
    }

    static fromString(value: string): SoqlDateLiteral {
        const DATE_LITERALS = [
            'TODAY',
            'YESTERDAY',
            'TOMORROW',
            'THIS_WEEK',
            'LAST_WEEK',
            'NEXT_WEEK',
            'THIS_MONTH',
            'LAST_MONTH',
            'NEXT_MONTH',
            'LAST_90_DAYS',
            'NEXT_90_DAYS',
            'THIS_QUARTER',
            'LAST_QUARTER',
            'NEXT_QUARTER',
            'THIS_YEAR',
            'LAST_YEAR',
            'NEXT_YEAR',
            'THIS_FISCAL_QUARTER',
            'LAST_FISCAL_QUARTER',
            'NEXT_FISCAL_QUARTER',
            'THIS_FISCAL_YEAR',
            'LAST_FISCAL_YEAR',
            'NEXT_FISCAL_YEAR',
        ]

        const DATE_LITERALS_DYNAMIC = [
            'LAST_N_DAYS',
            'NEXT_N_DAYS',
            'N_DAYS_AGO',
            'NEXT_N_WEEKS',
            'LAST_N_WEEKS',
            'N_WEEKS_AGO',
            'NEXT_N_MONTHS',
            'LAST_N_MONTHS',
            'N_MONTHS_AGO',
            'NEXT_N_QUARTERS',
            'LAST_N_QUARTERS',
            'N_QUARTERS_AGO',
            'NEXT_N_YEARS',
            'LAST_N_YEARS',
            'N_YEARS_AGO',
            'NEXT_N_FISCAL_YEARS',
            'LAST_N_FISCAL_YEARS',
            'N_FISCAL_YEARS_AGO',
            'NEXT_N_FISCAL_QUARTERS',
            'LAST_N_FISCAL_QUARTERS',
        ]

        if (DATE_LITERALS.includes(value)) {
            return new SoqlDateLiteral(value)
        }

        for (const prefix of DATE_LITERALS_DYNAMIC) {
            if (value.startsWith(prefix)) {
                const [literalType, nStr] = value.split(':')
                const n = Number(nStr)
                if (!isNaN(n)) {
                    return new SoqlDateLiteral({ type: literalType, n })
                }
            }
        }

        throw new SoqlParserError(`Invalid date literal: ${value}`)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlDateLiteral {
        const valueString = buffer.readString()

        const DATE_LITERALS = [
            'TODAY',
            'YESTERDAY',
            'TOMORROW',
            'THIS_WEEK',
            'LAST_WEEK',
            'NEXT_WEEK',
            'THIS_MONTH',
            'LAST_MONTH',
            'NEXT_MONTH',
            'LAST_90_DAYS',
            'NEXT_90_DAYS',
            'THIS_QUARTER',
            'LAST_QUARTER',
            'NEXT_QUARTER',
            'THIS_YEAR',
            'LAST_YEAR',
            'NEXT_YEAR',
            'THIS_FISCAL_QUARTER',
            'LAST_FISCAL_QUARTER',
            'NEXT_FISCAL_QUARTER',
            'THIS_FISCAL_YEAR',
            'LAST_FISCAL_YEAR',
            'NEXT_FISCAL_YEAR',
        ]

        const DATE_LITERALS_DYNAMIC = [
            'LAST_N_DAYS',
            'NEXT_N_DAYS',
            'N_DAYS_AGO',
            'NEXT_N_WEEKS',
            'LAST_N_WEEKS',
            'N_WEEKS_AGO',
            'NEXT_N_MONTHS',
            'LAST_N_MONTHS',
            'N_MONTHS_AGO',
            'NEXT_N_QUARTERS',
            'LAST_N_QUARTERS',
            'N_QUARTERS_AGO',
            'NEXT_N_YEARS',
            'LAST_N_YEARS',
            'N_YEARS_AGO',
            'NEXT_N_FISCAL_YEARS',
            'LAST_N_FISCAL_YEARS',
            'N_FISCAL_YEARS_AGO',
            'NEXT_N_FISCAL_QUARTERS',
            'LAST_N_FISCAL_QUARTERS',
        ]

        if (DATE_LITERALS.includes(valueString)) {
            return new SoqlDateLiteral(valueString)
        }

        for (const prefix of DATE_LITERALS_DYNAMIC) {
            if (valueString.startsWith(prefix)) {
                const [literalType, nStr] = valueString.split(':')
                const n = Number(nStr)
                if (!isNaN(n)) {
                    return new SoqlDateLiteral({ type: literalType, n })
                }
            }
        }

        throw new SoqlParserError(`Invalid date literal: ${valueString}`)
    }
}

export class SoqlDateTimeLiteral extends SoqlValueExpr {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }

    static fromString(value: string): SoqlDateTimeLiteral {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)) {
            throw new SoqlParserError(
                `Invalid datetime literal format (expected ISO 8601): ${value}`,
            )
        }
        return new SoqlDateTimeLiteral(value)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlDateTimeLiteral {
        const valueString = buffer.readString()
        if (
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(valueString)
        ) {
            return new SoqlDateTimeLiteral(valueString)
        }
        throw new SoqlParserError(
            `Invalid datetime literal format (expected ISO 8601): ${valueString}`,
        )
    }
}

export class SoqlBindVariable extends SoqlValueExpr {
    name: string

    constructor(name: string) {
        super()
        this.name = name
    }

    static fromString(value: string): SoqlBindVariable {
        const cleanValue = value.startsWith(':') ? value.slice(1) : value
        return new SoqlBindVariable(cleanValue)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlBindVariable {
        const valueString = buffer.readString()
        if (valueString.startsWith(':')) {
            return new SoqlBindVariable(valueString.slice(1))
        }
        throw new SoqlParserError(`Invalid bind variable: ${valueString}`)
    }
}

export class SoqlNullLiteral extends SoqlValueExpr {
    value: null = null

    constructor() {
        super()
    }

    static fromString(value: string): SoqlNullLiteral {
        return SoqlNullLiteral.fromBuffer(new SoqlStringBuffer(value))
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlNullLiteral {
        const valueString = buffer.readString()
        if (valueString.toLowerCase() !== 'null') {
            throw new SoqlParserError(`Invalid null literal: ${valueString}`)
        }
        return new SoqlNullLiteral()
    }
}

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

export class SoqlSubquery extends SoqlObject {
    subquery: SoqlQuery
    constructor(subquery: SoqlQuery) {
        super()
        this.subquery = subquery
    }

    static fromString(string: string): SoqlSubquery {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSubquery.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSubquery {
        const subquery = SoqlQuery.fromBuffer(buffer)
        return new SoqlSubquery(subquery)
    }
}

export class SoqlSelectItem extends SoqlObject {
    item: SoqlField | SoqlAggregateField | SoqlSubquery
    alias?: string

    constructor(options: {
        item: SoqlField | SoqlAggregateField | SoqlSubquery
        alias?: string
    }) {
        super()
        this.item = options.item
        if (options.alias) this.alias = options.alias
    }

    static fromString(string: string): SoqlSelectItem {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSelectItem.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSelectItem {
        buffer.skipWhitespace()

        if (buffer.peek() === BYTE_MAP.openParen) {
            buffer.expect(BYTE_MAP.openParen) // consume '('
            const subquery = SoqlSubquery.fromBuffer(buffer)
            return new SoqlSelectItem({ item: subquery })
        }

        let item: SoqlField | SoqlAggregateField

        const possibleFunction = buffer.tryParse(() =>
            SoqlAggregateField.fromBuffer(buffer),
        )

        if (possibleFunction) {
            item = possibleFunction
        } else {
            item = SoqlField.fromBuffer(buffer)
        }

        buffer.skipWhitespace()

        if (buffer.peek() === BYTE_MAP.comma || buffer.peek() === null) {
            return new SoqlSelectItem({ item })
        }

        let alias: string | undefined = undefined
        const possibleKeyword = buffer.peekKeyword()
        if (!possibleKeyword) {
            alias = buffer.readString()
        }

        return new SoqlSelectItem({ item, alias })
    }
}

export class SoqlSelectClause extends SoqlObject {
    items: SoqlSelectItem[]

    constructor(options: { items: SoqlSelectItem[] }) {
        super()
        this.items = options.items
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
        const items: SoqlSelectItem[] = []

        while (true) {
            const item = SoqlSelectItem.fromBuffer(buffer)
            items.push(item)
            buffer.skipWhitespace()
            const nextByte = buffer.peek()
            if (nextByte === BYTE_MAP.comma) {
                buffer.expect(BYTE_MAP.comma)
                buffer.skipWhitespace()
            } else {
                break
            }
        }

        return new SoqlSelectClause({ items })
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

export abstract class SoqlBooleanExpr extends SoqlObject {
    static fromString(string: string): SoqlBooleanExpr {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlBooleanExpr.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlBooleanExpr {
        // Parse OR expressions (lowest precedence)
        return SoqlBooleanExpr.parseOrExpr(buffer)
    }

    private static parseOrExpr(buffer: SoqlStringBuffer): SoqlBooleanExpr {
        let left = SoqlBooleanExpr.parseAndExpr(buffer)

        buffer.skipWhitespace()
        while (buffer.peekKeyword() === 'OR') {
            buffer.readKeyword() // consume OR
            buffer.skipWhitespace()
            const right = SoqlBooleanExpr.parseAndExpr(buffer)
            left = new SoqlOrExpr({ left, right })
            buffer.skipWhitespace()
        }

        return left
    }

    private static parseAndExpr(buffer: SoqlStringBuffer): SoqlBooleanExpr {
        let left = SoqlBooleanExpr.parsePrimaryExpr(buffer)

        buffer.skipWhitespace()
        while (buffer.peekKeyword() === 'AND') {
            buffer.readKeyword() // consume AND
            buffer.skipWhitespace()
            const right = SoqlBooleanExpr.parsePrimaryExpr(buffer)
            left = new SoqlAndExpr({ left, right })
            buffer.skipWhitespace()
        }

        return left
    }

    private static parsePrimaryExpr(buffer: SoqlStringBuffer): SoqlBooleanExpr {
        buffer.skipWhitespace()

        if (buffer.peek() === BYTE_MAP.openParen) {
            return SoqlParenExpr.fromBuffer(buffer)
        } else {
            return SoqlComparisonExpr.fromBuffer(buffer)
        }
    }
}

export abstract class SoqlLogicalExpr extends SoqlBooleanExpr {
    left: SoqlBooleanExpr
    right: SoqlBooleanExpr

    constructor(options: { left: SoqlBooleanExpr; right: SoqlBooleanExpr }) {
        super()
        this.left = options.left
        this.right = options.right
    }
}

export class SoqlAndExpr extends SoqlLogicalExpr {}

export class SoqlOrExpr extends SoqlLogicalExpr {}

export class SoqlComparisonExpr<
    T extends SoqlObject = SoqlValueExpr,
> extends SoqlBooleanExpr {
    left: SoqlValueExpr
    right: T

    constructor(options: { left: SoqlValueExpr; right: T }) {
        super()
        this.left = options.left
        this.right = options.right
    }

    static fromString(string: string): SoqlComparisonExpr {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlComparisonExpr.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlComparisonExpr {
        let expr: SoqlComparisonExpr

        // Try to parse as aggregate function first (for HAVING clauses), then as field
        let left: SoqlValueExpr
        const possibleAggregate = buffer.tryParse(() =>
            SoqlAggregateField.fromBuffer(buffer),
        )
        if (possibleAggregate) {
            left = possibleAggregate
        } else {
            left = SoqlField.fromBuffer(buffer)
        }

        buffer.skipWhitespace()

        const operatorString = buffer.readString().toUpperCase()
        if (!OPERATORS.includes(operatorString as SoqlOperator)) {
            throw new SoqlParserError(
                `Expected comparison operator, got: ${operatorString}`,
            )
        }
        const operator = operatorString as SoqlOperator

        buffer.skipWhitespace()

        if (operator === 'IN' || operator === 'NIN') {
            let right: SoqlQuery | SoqlValueExpr[]

            // Check if this is a subquery (SELECT) or a list of values
            buffer.expect(BYTE_MAP.openParen)
            buffer.skipWhitespace()

            const nextStr = buffer.peekString()
            if (nextStr.toUpperCase() === 'SELECT') {
                // Parse as subquery
                const query = SoqlQuery.fromBuffer(buffer)
                buffer.skipWhitespace()
                buffer.expect(BYTE_MAP.closeParen)
                right = query
            } else {
                // Parse as list of values
                const values: SoqlValueExpr[] = []
                while (true) {
                    const value = SoqlValueExpr.fromBuffer(buffer)
                    values.push(value)

                    buffer.skipWhitespace()
                    const nextByte = buffer.peek()
                    if (nextByte === BYTE_MAP.comma) {
                        buffer.expect(BYTE_MAP.comma)
                        buffer.skipWhitespace()
                    } else {
                        break
                    }
                }

                buffer.expect(BYTE_MAP.closeParen)
                right = values
            }

            if (operator === 'IN') {
                expr = new SoqlInExpr({ left, right })
            } else {
                expr = new SoqlNinExpr({ left, right })
            }
        } else if (operator === 'INCLUDES' || operator === 'EXCLUDES') {
            const values: SoqlValueExpr[] = []
            buffer.expect(BYTE_MAP.openParen)
            buffer.skipWhitespace()
            while (true) {
                const value = SoqlValueExpr.fromBuffer(buffer)
                values.push(value)

                buffer.skipWhitespace()
                const nextByte = buffer.peek()
                if (nextByte === BYTE_MAP.comma) {
                    buffer.expect(BYTE_MAP.comma)
                    buffer.skipWhitespace()
                } else {
                    break
                }
            }
            buffer.expect(BYTE_MAP.closeParen)

            if (operator === 'INCLUDES') {
                expr = new SoqlIncludesExpr({ left, right: values })
            } else {
                expr = new SoqlExcludesExpr({ left, right: values })
            }
        } else {
            const right = SoqlValueExpr.fromBuffer(buffer)
            switch (operator) {
                case '=':
                    expr = new SoqlEqlExpr({ left, right })
                    break
                case '!=':
                    expr = new SoqlNeExpr({ left, right })
                    break
                case '<':
                    expr = new SoqlLtExpr({ left, right })
                    break
                case '<=':
                    expr = new SoqlLeExpr({ left, right })
                    break
                case '>':
                    expr = new SoqlGtExpr({ left, right })
                    break
                case '>=':
                    expr = new SoqlGeExpr({ left, right })
                    break
                case 'LIKE':
                    expr = new SoqlLikeExpr({ left, right })
                    break
                case 'NLIKE':
                    expr = new SoqlNlineExpr({ left, right })
                    break
                default:
                    throw new SoqlParserError(
                        `Unsupported operator: ${operator}`,
                    )
            }
        }

        return expr
    }
}

export class SoqlInExpr extends SoqlComparisonExpr<
    SoqlValueExpr[] | SoqlQuery
> {}
export class SoqlNinExpr extends SoqlComparisonExpr<
    SoqlValueExpr[] | SoqlQuery
> {}
export class SoqlEqlExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlNeExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlLtExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlLeExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlGtExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlGeExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlLikeExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlNlineExpr extends SoqlComparisonExpr<SoqlValueExpr> {}
export class SoqlIncludesExpr extends SoqlComparisonExpr<SoqlValueExpr[]> {}
export class SoqlExcludesExpr extends SoqlComparisonExpr<SoqlValueExpr[]> {}

export class SoqlParenExpr extends SoqlBooleanExpr {
    expr: SoqlBooleanExpr

    constructor(expr: SoqlBooleanExpr) {
        super()
        this.expr = expr
    }

    static fromString(string: string): SoqlParenExpr {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlParenExpr.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlParenExpr {
        buffer.expect(BYTE_MAP.openParen)
        buffer.skipWhitespace()
        const expr = SoqlBooleanExpr.fromBuffer(buffer)
        buffer.skipWhitespace()
        buffer.expect(BYTE_MAP.closeParen)
        return new SoqlParenExpr(expr)
    }
}

export class SoqlWhereClause extends SoqlObject {
    expr: SoqlBooleanExpr // BooleanExpr type

    constructor(exprOrOptions: SoqlBooleanExpr) {
        super()
        this.expr = exprOrOptions
    }

    static fromString(string: string): SoqlWhereClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlWhereClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlWhereClause {
        const keyword = buffer.readKeyword()
        if (keyword !== 'WHERE') {
            throw new SoqlParserError(`Expected WHERE keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        const expr = SoqlBooleanExpr.fromBuffer(buffer)
        return new SoqlWhereClause(expr)
    }
}

export class SoqlGroupByField extends SoqlObject {
    field: SoqlField | SoqlAggregateField

    constructor(options: { field: SoqlField | SoqlAggregateField }) {
        super()
        this.field = options.field
    }

    static fromString(string: string): SoqlGroupByField {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlGroupByField.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlGroupByField {
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

        return new SoqlGroupByField({ field })
    }
}

export class SoqlGroupByClause extends SoqlObject {
    fields: SoqlGroupByField[]
    groupingFunction?: 'ROLLUP' | 'CUBE'

    constructor(options: {
        fields: SoqlGroupByField[]
        groupingFunction?: 'ROLLUP' | 'CUBE'
    }) {
        super()
        this.fields = options.fields
        this.groupingFunction = options.groupingFunction
    }

    static fromString(string: string): SoqlGroupByClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlGroupByClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlGroupByClause {
        let keyword = buffer.readKeyword()
        if (keyword !== 'GROUP') {
            throw new SoqlParserError(`Expected GROUP keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        keyword = buffer.readKeyword()
        if (keyword !== 'BY') {
            throw new SoqlParserError(`Expected BY keyword, got: ${keyword}`)
        }
        buffer.skipWhitespace()

        let groupingFunction: 'ROLLUP' | 'CUBE' | undefined = undefined
        const possibleKeyword = buffer.peekKeyword()
        if (possibleKeyword === 'ROLLUP' || possibleKeyword === 'CUBE') {
            groupingFunction = possibleKeyword
            buffer.expect(BYTE_MAP.openParen)
            buffer.skipWhitespace()
        }

        const fields: SoqlGroupByField[] = []

        while (true) {
            const field = SoqlGroupByField.fromBuffer(buffer)
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

        if (groupingFunction) {
            buffer.skipWhitespace()
            buffer.expect(BYTE_MAP.closeParen)
            buffer.skipWhitespace()
        }

        return new SoqlGroupByClause({
            fields,
            groupingFunction,
        })
    }
}

export class SoqlHavingClause extends SoqlObject {
    expr: SoqlBooleanExpr

    constructor(expr: SoqlBooleanExpr) {
        super()
        this.expr = expr
    }

    static fromString(string: string): SoqlHavingClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlHavingClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlHavingClause {
        const keyword = buffer.readKeyword()
        if (keyword !== 'HAVING') {
            throw new SoqlParserError(
                `Expected HAVING keyword, got: ${keyword}`,
            )
        }

        buffer.skipWhitespace()
        const expr = SoqlBooleanExpr.fromBuffer(buffer)
        return new SoqlHavingClause(expr)
    }
}

export class SoqlOrderByField extends SoqlObject {
    field: SoqlField | SoqlAggregateField
    direction: 'ASC' | 'DESC' | null

    constructor(options: {
        field: SoqlField | SoqlAggregateField
        direction: 'ASC' | 'DESC' | null
    }) {
        super()
        this.field = options.field
        this.direction = options.direction
    }

    static fromString(string: string): SoqlOrderByField {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlOrderByField.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlOrderByField {
        let field: SoqlField | SoqlAggregateField

        const possibleFunction = buffer.tryParse(() =>
            SoqlAggregateField.fromBuffer(buffer),
        )

        if (possibleFunction) {
            field = possibleFunction
        } else {
            field = SoqlField.fromBuffer(buffer)
        }

        const peekedKeyword = buffer.peekKeyword()
        if (peekedKeyword === 'ASC' || peekedKeyword === 'DESC') {
            const direction = buffer.readKeyword() as 'ASC' | 'DESC'
            return new SoqlOrderByField({ field, direction })
        }

        return new SoqlOrderByField({ field, direction: null })
    }
}

export class SoqlOrderByClause extends SoqlObject {
    fields: SoqlOrderByField[] // OrderByField[]

    constructor(fields: SoqlOrderByField[]) {
        super()
        this.fields = fields
    }

    static fromString(string: string): SoqlOrderByClause {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlOrderByClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlOrderByClause {
        let keyword = buffer.readKeyword()
        if (keyword !== 'ORDER') {
            throw new SoqlParserError(`Expected ORDER keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        keyword = buffer.readKeyword()
        if (keyword !== 'BY') {
            throw new SoqlParserError(`Expected BY keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        const fields: SoqlOrderByField[] = []

        while (true) {
            const field = SoqlOrderByField.fromBuffer(buffer)
            buffer.skipWhitespace()

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

        return new SoqlOrderByClause(fields)
    }
}

export class SoqlLimitClause extends SoqlObject {
    value: number

    constructor(value: number) {
        super()
        this.value = value
    }

    static fromString(string: string): number {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlLimitClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): number {
        const keyword = buffer.readKeyword()
        if (keyword !== 'LIMIT') {
            throw new SoqlParserError(`Expected LIMIT keyword, got: ${keyword}`)
        }

        buffer.skipWhitespace()
        const limitString = buffer.readString()
        const limit = Number(limitString)
        if (isNaN(limit)) {
            throw new SoqlParserError(`Invalid LIMIT value: ${limitString}`)
        }

        return limit
    }
}

export class SoqlOffsetClause extends SoqlObject {
    value: number

    constructor(value: number) {
        super()
        this.value = value
    }

    static fromString(string: string): number {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlOffsetClause.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): number {
        const keyword = buffer.readKeyword()
        if (keyword !== 'OFFSET') {
            throw new SoqlParserError(
                `Expected OFFSET keyword, got: ${keyword}`,
            )
        }

        buffer.skipWhitespace()
        const offsetString = buffer.readString()
        const offset = Number(offsetString)
        if (isNaN(offset)) {
            throw new SoqlParserError(`Invalid OFFSET value: ${offsetString}`)
        }

        return offset
    }
}

export class SoqlQuery extends SoqlObject {
    select: SoqlSelectClause
    from: SoqlFromClause
    where?: SoqlWhereClause
    groupBy?: SoqlGroupByClause
    having?: SoqlHavingClause
    orderBy?: SoqlOrderByClause
    limit?: number
    offset?: number

    constructor(options: {
        select: SoqlSelectClause
        from: SoqlFromClause
        where?: SoqlWhereClause
        groupBy?: SoqlGroupByClause
        having?: SoqlHavingClause
        orderBy?: SoqlOrderByClause
        limit?: number
        offset?: number
    }) {
        super()
        this.select = options.select
        this.from = options.from
        if (options.where) this.where = options.where
        if (options.groupBy) this.groupBy = options.groupBy
        if (options.having) this.having = options.having
        if (options.orderBy) this.orderBy = options.orderBy
        if (options.limit !== undefined) this.limit = options.limit
        if (options.offset !== undefined) this.offset = options.offset
    }

    static fromString(string: string): SoqlQuery {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlQuery.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlQuery {
        const select = SoqlSelectClause.fromBuffer(buffer)
        buffer.skipWhitespace()
        const from = SoqlFromClause.fromBuffer(buffer)

        let where: SoqlWhereClause | undefined = undefined
        let groupBy: SoqlGroupByClause | undefined = undefined
        let having: SoqlHavingClause | undefined = undefined
        let orderBy: SoqlOrderByClause | undefined = undefined
        let limit: number | undefined = undefined
        let offset: number | undefined = undefined

        buffer.skipWhitespace()
        let keyword = buffer.peekKeyword()

        if (keyword === 'WHERE') {
            where = SoqlWhereClause.fromBuffer(buffer)
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'GROUP') {
            groupBy = SoqlGroupByClause.fromBuffer(buffer)
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'HAVING') {
            having = SoqlHavingClause.fromBuffer(buffer)
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'ORDER') {
            orderBy = SoqlOrderByClause.fromBuffer(buffer)
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'LIMIT') {
            buffer.readKeyword() // consume LIMIT
            buffer.skipWhitespace()
            const limitString = buffer.readString()
            limit = Number(limitString)
            if (isNaN(limit)) {
                throw new SoqlParserError(`Invalid LIMIT value: ${limitString}`)
            }
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'OFFSET') {
            buffer.readKeyword() // consume OFFSET
            buffer.skipWhitespace()
            const offsetString = buffer.readString()
            offset = Number(offsetString)
            if (isNaN(offset)) {
                throw new SoqlParserError(
                    `Invalid OFFSET value: ${offsetString}`,
                )
            }
        }

        return new SoqlQuery({
            select,
            from,
            where,
            groupBy,
            having,
            orderBy,
            limit,
            offset,
        })
    }
}
