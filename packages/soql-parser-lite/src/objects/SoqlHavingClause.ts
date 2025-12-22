import { SoqlParserError } from '../errors'
import { SoqlBase } from './core/SoqlBase'
import { SoqlStringBuffer } from './core/SoqlStringBuffer'
import { SoqlBooleanExpr } from './SoqlBooleanExpr'

export class SoqlHavingClause extends SoqlBase {
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
        const expr = SoqlBooleanExpr.fromBuffer(buffer, true) // Allow aggregates in HAVING
        return new SoqlHavingClause(expr)
    }
}
