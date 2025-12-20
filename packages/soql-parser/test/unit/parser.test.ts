import { describe, it, expect } from 'vitest'
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
    })

    describe('From Clause Parsing', () => {
        it('should parse a from clause', () => {
            const soql = '  FROM Account a '
            const from = new SoqlFromClauseParser()

            from.feed(soql)
            from.eof = true

            const fromClause = from.read()
            expect(fromClause).toEqual({
                objects: [
                    {
                        name: 'Account',
                        alias: 'a',
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
        it('should parse a complete SOQL query with all clauses', () => {
            const soql =
                'SELECT Name, COUNT(Id) cnt FROM Account WHERE IsActive = true GROUP BY Name ORDER BY Name ASC LIMIT 10 OFFSET 5'
            const object = new SoqlQueryParser()

            object.feed(soql)
            object.eof = true

            const query = object.read()
            expect(query.select.items.length).toBe(2)
            expect(query.from.objects[0].name).toBe('Account')
            expect(query.where).toBeDefined()
            expect(query.groupBy).toBeDefined()
            expect(query.groupBy?.fields.length).toBe(1)
            expect(query.orderBy).toBeDefined()
            expect(query.orderBy?.fields.length).toBe(1)
            expect(query.limit).toBe(10)
            expect(query.offset).toBe(5)
        })
    })
})
