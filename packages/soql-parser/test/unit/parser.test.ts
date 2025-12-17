import { describe, it, expect } from 'vitest'
import { SoqlSelectParser, SoqlWhereClauseParser } from '../../src/index.js'

describe('SOQL Parsing', () => {
    describe('Select Clause Parsing', () => {
        it('should parse a select clause', () => {
            const soql =
                '  SELECT Name, Age, IsActive, Sub.Field, Sub.Field2  FROM User'
            const object = new SoqlSelectParser()

            object.feed(soql)

            const fields = object.read()
            expect(fields.map((x) => x.fieldName.parts.join('.'))).toEqual([
                'Name',
                'Age',
                'IsActive',
                'Sub.Field',
                'Sub.Field2',
            ])
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
    })
})
