import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlBooleanExpr } from './SoqlBooleanExpr.js'

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
