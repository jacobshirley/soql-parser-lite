import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'
import { SoqlSelectClause } from './SoqlSelectClause.js'
import { SoqlFromClause } from './SoqlFromClause.js'
import { SoqlWhereClause } from './SoqlWhereClause.js'
import { SoqlGroupByClause } from './SoqlGroupByClause.js'
import { SoqlHavingClause } from './SoqlHavingClause.js'
import { SoqlOrderByClause } from './SoqlOrderByClause.js'
import { SoqlWithClause } from './SoqlWithClause.js'

export class SoqlQuery extends SoqlBase {
    select: SoqlSelectClause
    from: SoqlFromClause
    where?: SoqlWhereClause
    groupBy?: SoqlGroupByClause
    having?: SoqlHavingClause
    orderBy?: SoqlOrderByClause
    limit?: number
    offset?: number
    /** `USING SCOPE <scope>` (e.g. `Mine`), as written in the query */
    usingScope?: string
    /** `WITH SECURITY_ENFORCED | USER_MODE | SYSTEM_MODE | DATA CATEGORY ...` */
    with?: SoqlWithClause
    /** `FOR VIEW | FOR REFERENCE | FOR UPDATE` */
    forClause?: 'VIEW' | 'REFERENCE' | 'UPDATE'
    /** `UPDATE TRACKING` and/or `UPDATE VIEWSTAT` */
    updateClause?: ('TRACKING' | 'VIEWSTAT')[]

    constructor(options: {
        select: SoqlSelectClause
        from: SoqlFromClause
        where?: SoqlWhereClause
        groupBy?: SoqlGroupByClause
        having?: SoqlHavingClause
        orderBy?: SoqlOrderByClause
        limit?: number
        offset?: number
        usingScope?: string
        with?: SoqlWithClause
        forClause?: 'VIEW' | 'REFERENCE' | 'UPDATE'
        updateClause?: ('TRACKING' | 'VIEWSTAT')[]
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
        if (options.usingScope !== undefined)
            this.usingScope = options.usingScope
        if (options.with) this.with = options.with
        if (options.forClause) this.forClause = options.forClause
        if (options.updateClause) this.updateClause = options.updateClause
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
        let usingScope: string | undefined = undefined
        let withClause: SoqlWithClause | undefined = undefined
        let forClause: 'VIEW' | 'REFERENCE' | 'UPDATE' | undefined = undefined
        let updateClause: ('TRACKING' | 'VIEWSTAT')[] | undefined = undefined

        buffer.skipWhitespace()
        let keyword = buffer.peekKeyword()

        if (keyword === 'USING') {
            buffer.readKeyword() // USING
            const scopeKeyword = buffer.readString().toUpperCase()
            if (scopeKeyword !== 'SCOPE') {
                throw new SoqlParserError(
                    `Expected SCOPE after USING, got: ${scopeKeyword || 'end of input'}`,
                )
            }
            usingScope = buffer.readString()
            if (!usingScope) {
                throw new SoqlParserError(
                    'Expected a scope name after USING SCOPE',
                )
            }
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'WHERE') {
            where = SoqlWhereClause.fromBuffer(buffer)
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'WITH') {
            withClause = SoqlWithClause.fromBuffer(buffer)
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
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'FOR') {
            buffer.readKeyword() // FOR
            const mode = buffer.readString().toUpperCase()
            if (mode !== 'VIEW' && mode !== 'REFERENCE' && mode !== 'UPDATE') {
                throw new SoqlParserError(
                    `Expected VIEW, REFERENCE or UPDATE after FOR, got: ${mode || 'end of input'}`,
                )
            }
            forClause = mode
            buffer.skipWhitespace()
            keyword = buffer.peekKeyword()
        }

        if (keyword === 'UPDATE') {
            buffer.readKeyword() // UPDATE
            updateClause = []
            while (true) {
                const option = buffer.readString().toUpperCase()
                if (option !== 'TRACKING' && option !== 'VIEWSTAT') {
                    throw new SoqlParserError(
                        `Expected TRACKING or VIEWSTAT after UPDATE, got: ${option || 'end of input'}`,
                    )
                }
                updateClause.push(option)
                buffer.skipWhitespace()
                if (buffer.peek() === BYTE_MAP.comma) {
                    buffer.expect(BYTE_MAP.comma)
                } else {
                    break
                }
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
            usingScope,
            with: withClause,
            forClause,
            updateClause,
        })
    }
}
