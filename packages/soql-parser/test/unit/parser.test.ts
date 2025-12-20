import { describe, it, expect, assert } from 'vitest'
import {
    FieldSelect,
    SoqlFromClauseParser,
    SoqlGroupByClauseParser,
    SoqlOrderByClauseParser,
    SoqlLimitClauseParser,
    SoqlOffsetClauseParser,
    SoqlQueryParser,
    SoqlSelectParser,
    SoqlWhereClauseParser,
    WhereClause,
} from '../../src/index.js'

describe('SOQL Parsing', () => {
    describe('Select Clause Parsing', () => {
        it('should parse a select clause', () => {
            const soql =
                '  SELECT Name, Age, IsActive, Sub.Field, Sub.Field2  FROM User'
            const object = new SoqlSelectParser()

            object.feed(soql)

            const fields = object.read()
            expect(
                fields.items.map((x) =>
                    (x as FieldSelect).fieldName.parts.join('.'),
                ),
            ).toEqual(['Name', 'Age', 'IsActive', 'Sub.Field', 'Sub.Field2'])
        })

        it('should parse a select clause with functions', () => {
            const soql =
                '  SELECT Name, COUNT(Id), MAX(Age), Sub.Field  FROM User'
            const object = new SoqlSelectParser()

            object.feed(soql)

            const fields = object.read()
            expect(fields.items).toEqual([
                {
                    type: 'field',
                    fieldName: { parts: ['Name'] },
                },
                {
                    type: 'aggregate',
                    functionName: 'COUNT',
                    fieldName: { parts: ['Id'] },
                },
                {
                    type: 'aggregate',
                    functionName: 'MAX',
                    fieldName: { parts: ['Age'] },
                },
                {
                    type: 'field',
                    fieldName: { parts: ['Sub', 'Field'] },
                },
            ])
        })

        it('should parse a select clause with aliases', () => {
            const soql =
                '  SELECT Name, COUNT(Id) cnt, MAX(Age) maxAge, Sub.Field f  FROM User'
            const object = new SoqlSelectParser()

            object.feed(soql)

            const fields = object.read()
            expect(fields.items).toEqual([
                {
                    type: 'field',
                    fieldName: { parts: ['Name'] },
                },
                {
                    type: 'aggregate',
                    functionName: 'COUNT',
                    fieldName: { parts: ['Id'] },
                    alias: 'cnt',
                },
                {
                    type: 'aggregate',
                    functionName: 'MAX',
                    fieldName: { parts: ['Age'] },
                    alias: 'maxAge',
                },
                {
                    type: 'field',
                    fieldName: { parts: ['Sub', 'Field'] },
                    alias: 'f',
                },
            ])
        })

        it('should be able to subquery in select clause', () => {
            const soql =
                '  SELECT Name, (SELECT Id, Subject FROM Events)  FROM User'
            const object = new SoqlSelectParser()

            object.feed(soql)

            const fields = object.read()
            expect(fields.items).toEqual([
                {
                    type: 'field',
                    fieldName: { parts: ['Name'] },
                },
                {
                    type: 'subquery',
                    subquery: {
                        type: 'soqlQuery',
                        select: {
                            items: [
                                {
                                    type: 'field',
                                    fieldName: { parts: ['Id'] },
                                },
                                {
                                    type: 'field',
                                    fieldName: { parts: ['Subject'] },
                                },
                            ],
                        },
                        from: {
                            objects: [
                                {
                                    name: 'Events',
                                },
                            ],
                        },
                    },
                },
            ])
        })
    })

    describe('From Clause Parsing', () => {
        it('should parse a from clause', () => {
            const soql = '  FROM Account'
            const from = new SoqlFromClauseParser()

            from.feed(soql)
            from.eof = true

            const fromClause = from.read()
            expect(fromClause).toEqual({
                objects: [
                    {
                        name: 'Account',
                    },
                ],
            })
        })

        it('should parse multiple from clauses', () => {
            const soql = '  FROM Account a, Contact c '
            const from = new SoqlFromClauseParser()

            from.feed(soql)
            from.eof = true

            const fromClause1 = from.read()
            expect(fromClause1).toEqual({
                objects: [
                    {
                        name: 'Account',
                        alias: 'a',
                    },
                    {
                        name: 'Contact',
                        alias: 'c',
                    },
                ],
            })
        })
    })

    describe('Where Clause Parsing', () => {
        it('should parse a basic where clause', () => {
            const soql =
                "  WHERE Name = 'John' AND Age >= 30 OR IsActive = true "
            const where = new SoqlWhereClauseParser()

            where.feed(soql)
            where.eof = true

            const whereClause = where.read()
            console.log(JSON.stringify(whereClause, null, 2))
            expect(whereClause).toEqual({
                expr: {
                    type: 'logical',
                    operator: 'AND',
                    left: {
                        type: 'comparison',
                        left: {
                            parts: ['Name'],
                        },
                        operator: '=',
                        right: {
                            type: 'string',
                            value: 'John',
                        },
                    },
                    right: {
                        type: 'logical',
                        operator: 'OR',
                        left: {
                            type: 'comparison',
                            left: {
                                parts: ['Age'],
                            },
                            operator: '>=',
                            right: {
                                type: 'number',
                                value: 30,
                            },
                        },
                        right: {
                            type: 'comparison',
                            left: {
                                parts: ['IsActive'],
                            },
                            operator: '=',
                            right: {
                                type: 'boolean',
                                value: true,
                            },
                        },
                    },
                },
            })
        })

        it('should parse a where clause with parentheses', () => {
            const soql =
                "  where (Name = 'John' and Age >= 30) or (IsActive = true) "
            const where = new SoqlWhereClauseParser()

            where.feed(soql)
            where.eof = true

            const whereClause = where.read()
            console.log(JSON.stringify(whereClause, null, 2))
            expect(whereClause).toEqual({
                expr: {
                    type: 'logical',
                    operator: 'OR',
                    left: {
                        type: 'paren',
                        expr: {
                            type: 'logical',
                            operator: 'AND',
                            left: {
                                type: 'comparison',
                                left: {
                                    parts: ['Name'],
                                },
                                operator: '=',
                                right: {
                                    type: 'string',
                                    value: 'John',
                                },
                            },
                            right: {
                                type: 'comparison',
                                left: {
                                    parts: ['Age'],
                                },
                                operator: '>=',
                                right: {
                                    type: 'number',
                                    value: 30,
                                },
                            },
                        },
                    },
                    right: {
                        type: 'paren',
                        expr: {
                            type: 'comparison',
                            left: {
                                parts: ['IsActive'],
                            },
                            operator: '=',
                            right: {
                                type: 'boolean',
                                value: true,
                            },
                        },
                    },
                },
            })
        })

        it('should support date literals in where clause', () => {
            const soql = ' where CreatedDate >= LAST_N_DAYS:30 '
            const where = new SoqlWhereClauseParser()

            where.feed(soql)
            where.eof = true

            const whereClause = where.read()
            console.log(JSON.stringify(whereClause, null, 2))
            expect(whereClause).toEqual({
                expr: {
                    type: 'comparison',
                    left: {
                        parts: ['CreatedDate'],
                    },
                    operator: '>=',
                    right: {
                        type: 'dateLiteral',
                        value: {
                            type: 'LAST_N_DAYS',
                            n: 30,
                        },
                    },
                },
            })
        })

        it('should support semi-join subqueries in where clause', () => {
            const soql =
                " where Id IN (SELECT UserId FROM Event WHERE Subject = 'Meeting') "
            const where = new SoqlWhereClauseParser()

            where.feed(soql)
            where.eof = true

            const whereClause = where.read()
            console.log(JSON.stringify(whereClause, null, 2))
            expect(whereClause).toEqual({
                expr: {
                    type: 'in',
                    left: {
                        parts: ['Id'],
                    },
                    right: {
                        type: 'soqlQuery',
                        select: {
                            items: [
                                {
                                    type: 'field',
                                    fieldName: {
                                        parts: ['UserId'],
                                    },
                                },
                            ],
                        },
                        from: {
                            objects: [
                                {
                                    name: 'Event',
                                },
                            ],
                        },
                        where: {
                            expr: {
                                type: 'comparison',
                                left: {
                                    parts: ['Subject'],
                                },
                                operator: '=',
                                right: {
                                    type: 'string',
                                    value: 'Meeting',
                                },
                            },
                        },
                    },
                },
            } satisfies WhereClause)
        })
    })

    describe('Group By Clause Parsing', () => {
        it('should parse a group by clause', () => {
            const soql = '  GROUP BY Name, Age, Sub.Field  '
            const object = new SoqlGroupByClauseParser()

            object.feed(soql)
            object.eof = true

            const groupBy = object.read()
            expect(groupBy.fields.map((x) => x.parts.join('.'))).toEqual([
                'Name',
                'Age',
                'Sub.Field',
            ])
        })
    })

    describe('Order By Clause Parsing', () => {
        it('should parse an order by clause', () => {
            const soql = '  ORDER BY Name ASC, Age DESC, Sub.Field  '
            const object = new SoqlOrderByClauseParser()

            object.feed(soql)
            object.eof = true

            const orderBy = object.read()
            expect(orderBy.fields).toEqual([
                {
                    field: { parts: ['Name'] },
                    direction: 'ASC',
                },
                {
                    field: { parts: ['Age'] },
                    direction: 'DESC',
                },
                {
                    field: { parts: ['Sub', 'Field'] },
                    direction: 'ASC',
                },
            ])
        })
    })

    describe('Limit Clause Parsing', () => {
        it('should parse a limit clause', () => {
            const soql = '  LIMIT 100  '
            const object = new SoqlLimitClauseParser()

            object.feed(soql)
            object.eof = true

            const limit = object.read()
            expect(limit).toBe(100)
        })
    })

    describe('Offset Clause Parsing', () => {
        it('should parse an offset clause', () => {
            const soql = '  OFFSET 50  '
            const object = new SoqlOffsetClauseParser()

            object.feed(soql)
            object.eof = true

            const offset = object.read()
            expect(offset).toBe(50)
        })
    })

    describe('Full SOQL Query Parsing', () => {
        it('should parse a query with GROUP BY and HAVING', () => {
            const soql =
                'SELECT Name FROM Account GROUP BY Name HAVING Name != null'
            const object = new SoqlQueryParser()

            object.feed(soql)
            object.eof = true

            const query = object.read()
            expect(query.select.items.length).toBe(1)
            expect(query.from.objects[0].name).toBe('Account')
            expect(query.groupBy).toBeDefined()
            expect(query.groupBy?.fields.length).toBe(1)
            expect(query.having).toBeDefined()
            expect(query.having?.expr.type).toBe('comparison')
        })

        it('should parse a complete SOQL query with all clauses', () => {
            const soql =
                'SELECT Name, COUNT(Id) cnt FROM Account WHERE IsActive = true GROUP BY Name HAVING Name != null ORDER BY Name ASC LIMIT 10 OFFSET 5'
            const object = new SoqlQueryParser()

            object.feed(soql)
            object.eof = true

            const query = object.read()
            expect(query.select.items.length).toBe(2)
            expect(query.from.objects[0].name).toBe('Account')
            expect(query.where).toBeDefined()
            expect(query.groupBy).toBeDefined()
            expect(query.groupBy?.fields.length).toBe(1)
            expect(query.having).toBeDefined()
            expect(query.orderBy).toBeDefined()
            expect(query.orderBy?.fields.length).toBe(1)
            expect(query.limit).toBe(10)
            expect(query.offset).toBe(5)
            expect(query).toEqual({
                from: {
                    objects: [
                        {
                            name: 'Account',
                        },
                    ],
                },
                groupBy: {
                    fields: [
                        {
                            parts: ['Name'],
                        },
                    ],
                },
                having: {
                    expr: {
                        left: {
                            parts: ['Name'],
                        },
                        operator: '!=',
                        right: {
                            type: 'null',
                            value: null,
                        },
                        type: 'comparison',
                    },
                },
                limit: 10,
                offset: 5,
                orderBy: {
                    fields: [
                        {
                            direction: 'ASC',
                            field: {
                                parts: ['Name'],
                            },
                        },
                    ],
                },
                select: {
                    items: [
                        {
                            fieldName: {
                                parts: ['Name'],
                            },
                            type: 'field',
                        },
                        {
                            alias: 'cnt',
                            fieldName: {
                                parts: ['Id'],
                            },
                            functionName: 'COUNT',
                            type: 'aggregate',
                        },
                    ],
                },
                type: 'soqlQuery',
                where: {
                    expr: {
                        left: {
                            parts: ['IsActive'],
                        },
                        operator: '=',
                        right: {
                            type: 'boolean',
                            value: true,
                        },
                        type: 'comparison',
                    },
                },
            })
        })

        it('should chain next() calls until null for complete query', () => {
            const soql = 'SELECT Name FROM Account'
            const queryParser = new SoqlQueryParser()

            queryParser.feed(soql)
            queryParser.eof = true

            // Start with SELECT
            const selectParser = queryParser.next()
            expect(selectParser).toBeInstanceOf(SoqlSelectParser)
            selectParser.read()

            // Move to FROM
            const fromParser = selectParser.next()
            expect(fromParser).toBeInstanceOf(SoqlFromClauseParser)
            fromParser.read()

            // FROM should be terminal for this query - next() returns null
            const next = fromParser.next()
            expect(next).toBeNull()
        })

        it('should chain through multiple parsers and eventually return null', () => {
            const soql = 'SELECT Name FROM Account LIMIT 10 OFFSET 5'
            const queryParser = new SoqlQueryParser()

            queryParser.feed(soql)
            queryParser.eof = true

            // Start with SELECT
            const selectParser = queryParser.next()
            expect(selectParser).toBeInstanceOf(SoqlSelectParser)
            selectParser.read()

            // Move to FROM
            const fromParser = selectParser.next()
            expect(fromParser).toBeInstanceOf(SoqlFromClauseParser)
            fromParser.read()

            // Move to LIMIT
            let next = fromParser.next()
            assert(next instanceof SoqlLimitClauseParser)
            next.read()

            // Move to OFFSET
            const offsetParser = next.next()
            assert(offsetParser instanceof SoqlOffsetClauseParser)
            offsetParser.read()

            // OFFSET should be terminal - next() returns null
            const terminal = offsetParser.next()
            expect(terminal).toBeNull()
        })

        it('should return null when no more clauses exist', () => {
            const soql = 'SELECT Name FROM Account WHERE IsActive = true'
            const queryParser = new SoqlQueryParser()

            queryParser.feed(soql)
            queryParser.eof = true

            const selectParser = queryParser.next()
            selectParser.read()

            const fromParser = selectParser.next()
            fromParser.read()

            const whereParser = fromParser.next()
            expect(whereParser).toBeInstanceOf(SoqlWhereClauseParser)
            whereParser!.read()

            // After WHERE with no more clauses, next() should return null
            const next = whereParser!.next()
            expect(next).toBeNull()
        })
    })
})
