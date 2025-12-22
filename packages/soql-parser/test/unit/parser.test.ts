import { describe, it, expect, assert } from 'vitest'
import {
    SoqlFromClause,
    SoqlSelectClause,
    SoqlWhereClause,
    SoqlGroupByClause,
    SoqlHavingClause,
    SoqlOrderByClause,
    SoqlQuery,
    SoqlAndExpr,
    SoqlAggregateField,
    SoqlField,
    SoqlSelectItem,
    SoqlOrExpr,
    SoqlBooleanLiteral,
    SoqlEqlExpr,
    SoqlNumberLiteral,
    SoqlGeExpr,
    SoqlStringLiteral,
    SoqlParenExpr,
} from '../../src/objects/field.js'
import type {
    WhereClause,
    OrderByClause,
    SelectClause,
} from '../../src/types.js'

describe('SOQL Parsing', () => {
    describe('Select Clause Parsing', () => {
        it('should parse a select clause', () => {
            const soql =
                '  SELECT Name, Age, IsActive, Sub.Field, Sub.Field2  FROM User'
            const select = SoqlSelectClause.fromString(soql)
            expect(select).toMatchInlineSnapshot(`
              SoqlSelectClause {
                "items": [
                  SoqlSelectItem {
                    "alias": undefined,
                    "item": SoqlField {
                      "name": "Name",
                    },
                  },
                  SoqlSelectItem {
                    "alias": undefined,
                    "item": SoqlField {
                      "name": "Age",
                    },
                  },
                  SoqlSelectItem {
                    "alias": undefined,
                    "item": SoqlField {
                      "name": "IsActive",
                    },
                  },
                  SoqlSelectItem {
                    "alias": undefined,
                    "item": SoqlField {
                      "name": "Sub.Field",
                    },
                  },
                  SoqlSelectItem {
                    "alias": undefined,
                    "item": SoqlField {
                      "name": "Sub.Field2",
                    },
                  },
                ],
              }
            `)
        })

        it('should parse a select clause with functions', () => {
            const soql =
                '  SELECT Name, COUNT(Id), MAX(Age), Sub.Field, MAX(Sub.Field)  FROM User'
            const select = SoqlSelectClause.fromString(soql)
            console.log(JSON.stringify(select, null, 2))
            expect(select).toEqual({
                items: [
                    {
                        item: {
                            name: 'Name',
                        },
                    },
                    {
                        item: {
                            functionName: 'COUNT',
                            field: {
                                name: 'Id',
                            },
                        },
                    },
                    {
                        item: {
                            functionName: 'MAX',
                            field: {
                                name: 'Age',
                            },
                        },
                    },
                    {
                        item: {
                            name: 'Sub.Field',
                        },
                    },
                    {
                        item: {
                            functionName: 'MAX',
                            field: {
                                name: 'Sub.Field',
                            },
                        },
                    },
                ],
            })
        })

        it('should parse a select clause with aliases', () => {
            const soql =
                '  SELECT Name, COUNT(Id) cnt, MAX(Age) maxAge , Sub.Field f  FROM User'
            const select = SoqlSelectClause.fromString(soql)

            const aliasedFields = select.items.filter(
                (x) => x.alias !== undefined,
            )
            expect(aliasedFields).toEqual([
                new SoqlSelectItem({
                    item: new SoqlAggregateField({
                        functionName: 'COUNT',
                        field: new SoqlField('Id'),
                    }),
                    alias: 'cnt',
                }),
                new SoqlSelectItem({
                    item: new SoqlAggregateField({
                        functionName: 'MAX',
                        field: new SoqlField('Age'),
                    }),
                    alias: 'maxAge',
                }),
                new SoqlSelectItem({
                    item: new SoqlField('Sub.Field'),
                    alias: 'f',
                }),
            ])
        })

        it('should be able to subquery in select clause', () => {
            const soql =
                '  SELECT Name, (SELECT Id, Subject FROM Events)  FROM User'
            const select = SoqlSelectClause.fromString(soql)
            console.log(JSON.stringify(select, null, 2))

            expect(select).toEqual({
                items: [
                    {
                        item: {
                            name: 'Name',
                        },
                    },
                    {
                        item: {
                            subquery: {
                                select: {
                                    items: [
                                        {
                                            item: {
                                                name: 'Id',
                                            },
                                        },
                                        {
                                            item: {
                                                name: 'Subject',
                                            },
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
                    },
                ],
            } satisfies SoqlSelectClause)
        })
    })

    describe('From Clause Parsing', () => {
        it('should parse a from clause', () => {
            const soql = '  FROM Account'
            const from = SoqlFromClause.fromString(soql)

            expect(from).toEqual({
                objects: [
                    {
                        name: 'Account',
                    },
                ],
            })
        })

        it('should parse multiple from clauses', () => {
            const soql = '  FROM Account a, Contact c '
            const from = SoqlFromClause.fromString(soql)

            expect(from).toEqual({
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
            } satisfies SoqlFromClause)
        })
    })

    describe('Where Clause Parsing', () => {
        it('should parse a basic where clause', () => {
            const soql =
                "  WHERE Name = 'John' AND Age >= 30 OR IsActive = true "
            const where = SoqlWhereClause.fromString(soql)
            expect(where).toEqual(
                new SoqlWhereClause(
                    new SoqlOrExpr({
                        left: new SoqlAndExpr({
                            left: new SoqlEqlExpr({
                                left: new SoqlField('Name'),
                                right: new SoqlStringLiteral('John'),
                            }),
                            right: new SoqlGeExpr({
                                left: new SoqlField('Age'),
                                right: new SoqlNumberLiteral(30),
                            }),
                        }),
                        right: new SoqlEqlExpr({
                            left: new SoqlField('IsActive'),
                            right: new SoqlBooleanLiteral(true),
                        }),
                    }),
                ),
            )
        })

        it.only('should parse a where clause with parentheses', () => {
            const soql =
                "  where (Name = 'John' and Age >= 30) or (IsActive = true) "
            const whereClause = SoqlWhereClause.fromString(soql)
            expect(whereClause).toEqual(
                new SoqlWhereClause(
                    new SoqlOrExpr({
                        left: new SoqlParenExpr(
                            new SoqlAndExpr({
                                left: new SoqlEqlExpr({
                                    left: new SoqlField('Name'),
                                    right: new SoqlStringLiteral('John'),
                                }),
                                right: new SoqlGeExpr({
                                    left: new SoqlField('Age'),
                                    right: new SoqlNumberLiteral(30),
                                }),
                            }),
                        ),
                        right: new SoqlParenExpr(
                            new SoqlEqlExpr({
                                left: new SoqlField('IsActive'),
                                right: new SoqlBooleanLiteral(true),
                            }),
                        ),
                    }),
                ),
            )
        })

        it('should support date literals in where clause', () => {
            const soql = ' where CreatedDate >= LAST_N_DAYS:30 '
            const where = new SoqlWhereClauseParser()

            where.feed(soql)
            where.eof = true

            const whereClause = where.read()
            expect(whereClause).toEqual({
                expr: {
                    type: 'comparison',
                    left: {
                        type: 'field',
                        fieldName: {
                            parts: ['CreatedDate'],
                        },
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
            } satisfies WhereClause)
        })

        it('should support semi-join subqueries in where clause', () => {
            const soql =
                " where Id IN (SELECT UserId FROM Event WHERE Subject = 'Meeting') "
            const where = new SoqlWhereClauseParser()

            where.feed(soql)
            where.eof = true

            const whereClause = where.read()
            expect(whereClause).toEqual({
                expr: {
                    type: 'in',
                    left: {
                        type: 'field',
                        fieldName: {
                            parts: ['Id'],
                        },
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
                                    type: 'field',
                                    fieldName: {
                                        parts: ['Subject'],
                                    },
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
            expect(
                groupBy.fields.map((x) => x.fieldName.parts.join('.')),
            ).toEqual(['Name', 'Age', 'Sub.Field'])
        })
    })

    describe('Having Clause Parsing', () => {
        it('should parse a having clause', () => {
            const soql = '  HAVING COUNT(Id) > 5  '
            const object = new SoqlHavingClauseParser()

            object.feed(soql)
            object.eof = true

            const having = object.read()
            expect(having).toEqual({
                expr: {
                    type: 'comparison',
                    left: {
                        type: 'aggregate',
                        functionName: 'COUNT',
                        fieldName: { parts: ['Id'] },
                    },
                    operator: '>',
                    right: {
                        type: 'number',
                        value: 5,
                    },
                },
            })
        })
    })

    describe('Order By Clause Parsing', () => {
        it('should parse an order by clause', () => {
            const soql = '  ORDER BY Name ASC, Age DESC, Sub.Field  '
            const object = new SoqlOrderByClauseParser()

            object.feed(soql)
            object.eof = true

            const orderBy = object.read()
            expect(orderBy).toEqual({
                fields: [
                    {
                        field: {
                            type: 'field',
                            fieldName: {
                                parts: ['Name'],
                            },
                        },
                        direction: 'ASC',
                    },
                    {
                        field: {
                            type: 'field',
                            fieldName: {
                                parts: ['Age'],
                            },
                        },
                        direction: 'DESC',
                    },
                    {
                        field: {
                            type: 'field',
                            fieldName: {
                                parts: ['Sub', 'Field'],
                            },
                        },
                        direction: null,
                    },
                ],
            } satisfies OrderByClause)
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
                            type: 'field',
                            fieldName: {
                                parts: ['Name'],
                            },
                        },
                    ],
                },
                having: {
                    expr: {
                        left: {
                            type: 'field',
                            fieldName: {
                                parts: ['Name'],
                            },
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
                                type: 'field',
                                fieldName: {
                                    parts: ['Name'],
                                },
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
                            type: 'field',
                            fieldName: {
                                parts: ['IsActive'],
                            },
                        },
                        operator: '=',
                        right: {
                            type: 'boolean',
                            value: true,
                        },
                        type: 'comparison',
                    },
                },
            } satisfies SoqlQuery)
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
