import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'

describe('Soql Helpers', () => {
    describe('parseSoqlQuery', () => {
        it('should parse a simple SOQL query', () => {
            const soql =
                'SELECT Id, Name FROM Account a WHERE a.IsActive = true'
            const query = parseSoqlQuery(soql)

            expect(query).toEqual({
                from: {
                    objects: [
                        {
                            name: 'Account',
                            alias: 'a',
                        },
                    ],
                },
                groupBy: undefined,
                having: undefined,
                limit: undefined,
                offset: undefined,
                orderBy: undefined,
                select: {
                    items: [
                        {
                            fieldName: {
                                parts: ['Id'],
                            },
                            type: 'field',
                        },
                        {
                            fieldName: {
                                parts: ['Name'],
                            },
                            type: 'field',
                        },
                    ],
                },
                type: 'soqlQuery',
                where: {
                    expr: {
                        left: {
                            parts: ['a', 'IsActive'],
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
    })
})
