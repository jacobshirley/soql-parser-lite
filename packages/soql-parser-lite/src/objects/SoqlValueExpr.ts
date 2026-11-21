import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { DATE_LITERALS, DATE_LITERALS_DYNAMIC } from '../types.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'

// Base class for all value expressions
export abstract class SoqlValueExpr extends SoqlBase {
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
            } else if (isDateLiteral(nextStr)) {
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

// String literal
export class SoqlStringLiteral extends SoqlValueExpr {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }

    static fromString(value: string): SoqlStringLiteral {
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

// Number literal
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

// Boolean literal
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

// Date value literal (YYYY-MM-DD)
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

// Date literal (TODAY, YESTERDAY, LAST_N_DAYS:n, etc.)
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
        return parseDateLiteral(value)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlDateLiteral {
        return parseDateLiteral(buffer.readString())
    }
}

/**
 * Matches `TODAY` or `LAST_N_DAYS:n` style literals case-insensitively and
 * exactly (no prefix matching). `n` must be a non-negative integer.
 */
const DYNAMIC_DATE_LITERAL_RE = /^([A-Za-z_]+):(\d+)$/

function isDateLiteral(text: string): boolean {
    const upper = text.toUpperCase()
    if ((DATE_LITERALS as readonly string[]).includes(upper)) return true
    // NAME:... with a known dynamic literal name is routed to the date literal
    // parser so malformed forms (empty or non-integer n) get a clear error
    const name = upper.split(':')[0]
    return (
        text.includes(':') &&
        (DATE_LITERALS_DYNAMIC as readonly string[]).includes(name)
    )
}

function parseDateLiteral(text: string): SoqlDateLiteral {
    const upper = text.toUpperCase()
    if ((DATE_LITERALS as readonly string[]).includes(upper)) {
        return new SoqlDateLiteral(upper)
    }

    const match = DYNAMIC_DATE_LITERAL_RE.exec(text)
    if (
        match &&
        (DATE_LITERALS_DYNAMIC as readonly string[]).includes(
            match[1].toUpperCase(),
        )
    ) {
        const n = Number(match[2])
        if (Number.isSafeInteger(n)) {
            return new SoqlDateLiteral({ type: match[1].toUpperCase(), n })
        }
    }

    throw new SoqlParserError(`Invalid date literal: ${text}`)
}

// DateTime literal (ISO 8601 format)
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

// Bind variable (:variableName)
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

// Null literal
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
