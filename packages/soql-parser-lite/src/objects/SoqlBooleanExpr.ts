import { BYTE_MAP } from '../byte-map'
import { SoqlBase } from './core/SoqlBase'
import { SoqlStringBuffer } from './core/SoqlStringBuffer'
import { SoqlValueExpr } from './SoqlValueExpr'
import { SoqlQuery } from './SoqlQuery'
import { SoqlParserError } from '../errors'
import { SoqlAggregateField } from './SoqlAggregateField'
import { SoqlField } from './SoqlField'
import { OPERATORS, SoqlOperator } from '../types'

export abstract class SoqlBooleanExpr extends SoqlBase {
    static fromString(
        string: string,
        allowAggregates = false,
    ): SoqlBooleanExpr {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlBooleanExpr.fromBuffer(stringBuffer, allowAggregates)
    }

    static fromBuffer(
        buffer: SoqlStringBuffer,
        allowAggregates = false,
    ): SoqlBooleanExpr {
        // Parse OR expressions (lowest precedence)
        return SoqlBooleanExpr.parseOrExpr(buffer, allowAggregates)
    }

    private static parseOrExpr(
        buffer: SoqlStringBuffer,
        allowAggregates: boolean,
    ): SoqlBooleanExpr {
        let left = SoqlBooleanExpr.parseAndExpr(buffer, allowAggregates)

        buffer.skipWhitespace()
        while (buffer.peekKeyword() === 'OR') {
            buffer.readKeyword() // consume OR
            buffer.skipWhitespace()
            const right = SoqlBooleanExpr.parseAndExpr(buffer, allowAggregates)
            left = new SoqlOrExpr({ left, right })
            buffer.skipWhitespace()
        }

        return left
    }

    private static parseAndExpr(
        buffer: SoqlStringBuffer,
        allowAggregates: boolean,
    ): SoqlBooleanExpr {
        let left = SoqlBooleanExpr.parsePrimaryExpr(buffer, allowAggregates)

        buffer.skipWhitespace()
        while (buffer.peekKeyword() === 'AND') {
            buffer.readKeyword() // consume AND
            buffer.skipWhitespace()
            const right = SoqlBooleanExpr.parsePrimaryExpr(
                buffer,
                allowAggregates,
            )
            left = new SoqlAndExpr({ left, right })
            buffer.skipWhitespace()
        }

        return left
    }

    private static parsePrimaryExpr(
        buffer: SoqlStringBuffer,
        allowAggregates: boolean,
    ): SoqlBooleanExpr {
        buffer.skipWhitespace()

        if (buffer.peek() === BYTE_MAP.openParen) {
            return SoqlParenExpr.fromBuffer(buffer, allowAggregates)
        } else {
            return SoqlComparisonExpr.fromBuffer(buffer, allowAggregates)
        }
    }
}

export class SoqlComparisonExpr<T = SoqlValueExpr> extends SoqlBooleanExpr {
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

    static fromBuffer(
        buffer: SoqlStringBuffer,
        allowAggregates = false,
    ): SoqlComparisonExpr {
        let expr: SoqlComparisonExpr<any>

        // Try to parse as aggregate function first (for HAVING clauses), then as field
        let left: SoqlValueExpr
        const possibleAggregate = buffer.tryParse(() =>
            SoqlAggregateField.fromBuffer(buffer),
        )
        if (possibleAggregate) {
            if (!allowAggregates) {
                throw new SoqlParserError(
                    'Aggregate functions are not allowed in WHERE clause',
                )
            }
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

// All comparison operator subclasses
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

    static fromBuffer(
        buffer: SoqlStringBuffer,
        allowAggregates = false,
    ): SoqlParenExpr {
        buffer.expect(BYTE_MAP.openParen)
        buffer.skipWhitespace()
        const expr = SoqlBooleanExpr.fromBuffer(buffer, allowAggregates)
        buffer.skipWhitespace()
        buffer.expect(BYTE_MAP.closeParen)
        return new SoqlParenExpr(expr)
    }
}
