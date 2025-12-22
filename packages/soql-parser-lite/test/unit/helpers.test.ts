import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import {
    SoqlBooleanLiteral,
    SoqlEqlExpr,
    SoqlField,
    SoqlFromClause,
    SoqlFromObject,
    SoqlQuery,
    SoqlSelectClause,
    SoqlSelectItem,
    SoqlSubquery,
    SoqlWhereClause,
} from '../../src'

describe('Soql Helpers', () => {
    describe('parseSoqlQuery', () => {
        it('should parse a simple SOQL query', () => {
            const soql =
                'SELECT Id, Name, (SELECT Id FROM Contacts) FROM Account a WHERE a.IsActive = true'
            const query = parseSoqlQuery(soql)

            expect(query).toEqual(
                new SoqlQuery({
                    select: new SoqlSelectClause({
                        items: [
                            new SoqlSelectItem({
                                item: new SoqlField('Id'),
                            }),
                            new SoqlSelectItem({
                                item: new SoqlField('Name'),
                            }),
                            new SoqlSelectItem({
                                item: new SoqlSubquery({
                                    subquery: new SoqlQuery({
                                        select: new SoqlSelectClause({
                                            items: [
                                                new SoqlSelectItem({
                                                    item: new SoqlField('Id'),
                                                }),
                                            ],
                                        }),
                                        from: new SoqlFromClause({
                                            objects: [
                                                new SoqlFromObject({
                                                    name: 'Contacts',
                                                }),
                                            ],
                                        }),
                                    }),
                                }),
                            }),
                        ],
                    }),
                    from: new SoqlFromClause({
                        objects: [
                            new SoqlFromObject({
                                name: 'Account',
                                alias: 'a',
                            }),
                        ],
                    }),
                    where: new SoqlWhereClause({
                        expr: new SoqlEqlExpr({
                            left: new SoqlField('a.IsActive'),
                            right: new SoqlBooleanLiteral(true),
                        }),
                    }),
                }),
            )
        })
    })
})
