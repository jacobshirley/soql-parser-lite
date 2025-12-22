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
    SoqlWhereClause,
} from '../../src'

describe('Soql Helpers', () => {
    describe('parseSoqlQuery', () => {
        it('should parse a simple SOQL query', () => {
            const soql =
                'SELECT Id, Name FROM Account a WHERE a.IsActive = true'
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
