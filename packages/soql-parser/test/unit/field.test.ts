import { describe, it, expect, assert } from 'vitest'
import {
    SoqlFromClause,
    SoqlSelectClause,
    SoqlWhereClause,
    SoqlGroupByClause,
    SoqlHavingClause,
    SoqlOrderByClause,
    SoqlLimitClause,
    SoqlOffsetClause,
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
    SoqlDateLiteral,
    SoqlNeExpr,
    SoqlOrderByField,
    SoqlGtExpr,
} from '../../src/objects/field.js'

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

        it('should parse a where clause with parentheses', () => {
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
            const where = SoqlWhereClause.fromString(soql)

            expect(where).toEqual(
                new SoqlWhereClause(
                    new SoqlGeExpr({
                        left: new SoqlField('CreatedDate'),
                        right: new SoqlDateLiteral({
                            type: 'LAST_N_DAYS',
                            n: 30,
                        }),
                    }),
                ),
            )
        })

        it('should support semi-join subqueries in where clause', () => {
            const soql =
                " where Id IN (SELECT UserId FROM Event WHERE Subject = 'Meeting') "
            const where = SoqlWhereClause.fromString(soql)

            // Check that it parses successfully
            expect(where).toBeInstanceOf(SoqlWhereClause)
            expect(where.expr).toBeDefined()

            // Check it's an IN expression with a query
            const expr = where.expr as any
            expect(expr.left).toBeInstanceOf(SoqlField)
            expect((expr.left as SoqlField).name).toBe('Id')
            expect(expr.right).toBeInstanceOf(SoqlQuery)

            // Check the subquery structure
            const subquery = expr.right as SoqlQuery
            expect(subquery.select.items.length).toBe(1)
            expect(subquery.from.objects[0].name).toBe('Event')
            expect(subquery.where).toBeDefined()
        })

        it('should not allow aggregate fields in where clause', () => {
            const soql = ' where COUNT(Id) > 5 '
            expect(() => {
                SoqlWhereClause.fromString(soql)
            }).toThrowError(
                'Aggregate functions are not allowed in WHERE clause',
            )
        })
    })

    describe('Group By Clause Parsing', () => {
        it('should parse a group by clause', () => {
            const soql = '  GROUP BY Name, Age, Sub.Field  '
            const groupBy = SoqlGroupByClause.fromString(soql)

            expect(
                groupBy.fields.map((x) => (x.field as SoqlField).name),
            ).toEqual(['Name', 'Age', 'Sub.Field'])
        })
    })

    describe('Having Clause Parsing', () => {
        it('should parse a having clause', () => {
            const soql = '  HAVING COUNT(Id) > 5  '
            const having = SoqlHavingClause.fromString(soql)

            // Check structure
            expect(having).toBeInstanceOf(SoqlHavingClause)
            const expr = having.expr as any
            expect(expr.left).toBeInstanceOf(SoqlAggregateField)
            expect(expr.left.functionName).toBe('COUNT')
            expect(expr.left.field.name).toBe('Id')
            expect(expr.right).toBeInstanceOf(SoqlNumberLiteral)
            expect(expr.right.value).toBe(5)
        })
    })

    describe('Order By Clause Parsing', () => {
        it('should parse an order by clause', () => {
            const soql = '  ORDER BY Name ASC, Age DESC, Sub.Field  '
            const orderBy = SoqlOrderByClause.fromString(soql)

            expect(orderBy.fields.length).toBe(3)
            expect(orderBy.fields[0]).toBeInstanceOf(SoqlOrderByField)
            expect((orderBy.fields[0].field as SoqlField).name).toBe('Name')
            expect(orderBy.fields[0].direction).toBe('ASC')

            expect((orderBy.fields[1].field as SoqlField).name).toBe('Age')
            expect(orderBy.fields[1].direction).toBe('DESC')

            expect((orderBy.fields[2].field as SoqlField).name).toBe(
                'Sub.Field',
            )
            expect(orderBy.fields[2].direction).toBeNull()
        })
    })

    describe('Limit Clause Parsing', () => {
        it('should parse a limit clause', () => {
            const soql = '  LIMIT 100  '
            const limit = SoqlLimitClause.fromString(soql)
            expect(limit).toBe(100)
        })
    })

    describe('Offset Clause Parsing', () => {
        it('should parse an offset clause', () => {
            const soql = '  OFFSET 50  '
            const offset = SoqlOffsetClause.fromString(soql)
            expect(offset).toBe(50)
        })
    })

    describe('Full SOQL Query Parsing', () => {
        it('should parse a query with GROUP BY and HAVING', () => {
            const soql =
                'SELECT Name FROM Account GROUP BY Name HAVING Name != null'
            const query = SoqlQuery.fromString(soql)
            expect(query.select.items.length).toBe(1)
            expect(query.from.objects[0].name).toBe('Account')
            expect(query.groupBy).toBeDefined()
            expect(query.groupBy?.fields.length).toBe(1)
            expect(query.having).toBeDefined()

            // Check having expr structure
            const havingExpr = query.having?.expr as any
            expect(havingExpr).toBeInstanceOf(SoqlNeExpr)
        })

        it('should parse a complete SOQL query with all clauses', () => {
            const soql =
                'SELECT Name, COUNT(Id) cnt FROM Account WHERE IsActive = true GROUP BY Name HAVING Name != null ORDER BY Name ASC LIMIT 10 OFFSET 5'
            const query = SoqlQuery.fromString(soql)

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

            // Verify basic structure
            expect(query.select).toBeInstanceOf(SoqlSelectClause)
            expect(query.from).toBeInstanceOf(SoqlFromClause)
            expect(query.where).toBeInstanceOf(SoqlWhereClause)
            expect(query.groupBy).toBeInstanceOf(SoqlGroupByClause)
            expect(query.having).toBeInstanceOf(SoqlHavingClause)
            expect(query.orderBy).toBeInstanceOf(SoqlOrderByClause)
        })
    })
})
