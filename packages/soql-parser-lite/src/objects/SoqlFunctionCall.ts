import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { AGGREGATE_FUNCTIONS, KNOWN_FUNCTIONS } from '../types.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlAggregateField } from './SoqlAggregateField.js'
import { SoqlField } from './SoqlField.js'
import { SoqlValueExpr } from './SoqlValueExpr.js'

export type SoqlFunctionArg = SoqlField | SoqlFunctionCall | SoqlValueExpr

/**
 * A SOQL function call with any number of arguments, each of which may be a
 * field, a literal or another function call, e.g.
 * `DISTANCE(Location__c, GEOLOCATION(37.775, -122.418), 'mi')` or
 * `FORMAT(convertCurrency(Amount))`.
 *
 * A call to an aggregate function (`COUNT`, `MIN`, `MAX`, `SUM`, `AVG`,
 * `COUNT_DISTINCT`) with a single plain field argument is represented as a
 * {@link SoqlAggregateField} instead, for compatibility.
 */
export class SoqlFunctionCall extends SoqlBase {
    functionName: string
    args: SoqlFunctionArg[]

    constructor(options: { functionName: string; args: SoqlFunctionArg[] }) {
        super()
        this.functionName = options.functionName
        this.args = options.args
    }

    static fromString(string: string): SoqlFunctionCall | SoqlAggregateField {
        return SoqlFunctionCall.fromBuffer(new SoqlStringBuffer(string))
    }

    static fromBuffer(
        buffer: SoqlStringBuffer,
    ): SoqlFunctionCall | SoqlAggregateField {
        buffer.skipWhitespace()
        const functionName = buffer.readString()
        const upperName = functionName.toUpperCase()

        if (!KNOWN_FUNCTIONS.includes(upperName)) {
            throw new SoqlParserError(`Unknown function: ${functionName}`)
        }

        buffer.skipWhitespace()
        buffer.expect(BYTE_MAP.openParen)
        buffer.skipWhitespace()

        const args: SoqlFunctionArg[] = []
        if (buffer.peek() !== BYTE_MAP.closeParen) {
            while (true) {
                args.push(SoqlFunctionCall.parseArg(buffer))
                buffer.skipWhitespace()
                if (buffer.peek() === BYTE_MAP.comma) {
                    buffer.expect(BYTE_MAP.comma)
                    buffer.skipWhitespace()
                } else {
                    break
                }
            }
        }
        buffer.expect(BYTE_MAP.closeParen)
        buffer.skipWhitespace()

        if (
            AGGREGATE_FUNCTIONS.includes(upperName) &&
            args.length === 1 &&
            args[0] instanceof SoqlField
        ) {
            return new SoqlAggregateField({ functionName, field: args[0] })
        }

        return new SoqlFunctionCall({ functionName, args })
    }

    private static parseArg(buffer: SoqlStringBuffer): SoqlFunctionArg {
        const next = buffer.peek()
        if (next === BYTE_MAP.asterisk) {
            throw new SoqlParserError(
                "'*' is not a valid function argument in SOQL (use COUNT())",
            )
        }
        if (buffer.peekIsFunctionCall()) {
            return SoqlFunctionCall.fromBuffer(buffer)
        }
        if (
            next === BYTE_MAP.singleQuote ||
            next === BYTE_MAP.doubleQuote ||
            next === BYTE_MAP.colon ||
            (next !== null && /[0-9+-]/.test(String.fromCharCode(next)))
        ) {
            return SoqlValueExpr.fromBuffer(buffer)
        }
        return SoqlField.fromBuffer(buffer)
    }
}
