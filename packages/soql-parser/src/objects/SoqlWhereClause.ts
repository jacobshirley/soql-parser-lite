import { SoqlParserError } from '../errors'
import { SoqlBase } from './SoqlBase'
import { SoqlStringBuffer } from './SoqlStringBuffer'
import { SoqlBooleanExpr } from './SoqlBooleanExpr'

export class SoqlWhereClause extends SoqlBase {
    expr: SoqlBooleanExpr // BooleanExpr type

    constructor(options: { expr: SoqlBooleanExpr }) {
        super()
        this.expr = options.expr
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
        const expr = SoqlBooleanExpr.fromBuffer(buffer, false) // Don't allow aggregates in WHERE
        return new SoqlWhereClause({ expr })
    }
}
