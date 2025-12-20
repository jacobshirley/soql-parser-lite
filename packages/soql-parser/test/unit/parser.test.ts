import { describe, it, expect } from 'vitest'
import {
    FieldSelect,
    SoqlFromClauseParser,
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
})
