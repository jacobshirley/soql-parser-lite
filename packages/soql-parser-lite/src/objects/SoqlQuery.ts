import { SoqlParserError } from '../errors'
import { SoqlBase } from './core/SoqlBase'
import { SoqlStringBuffer } from './core/SoqlStringBuffer'
import { SoqlSelectClause } from './SoqlSelectClause'
import { SoqlFromClause } from './SoqlFromClause'
import { SoqlWhereClause } from './SoqlWhereClause'
import { SoqlGroupByClause } from './SoqlGroupByClause'
import { SoqlHavingClause } from './SoqlHavingClause'
import { SoqlOrderByClause } from './SoqlOrderByClause'

export class SoqlQuery extends SoqlBase {
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
