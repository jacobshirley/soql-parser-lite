import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'

const whereJson = (clause: string) =>
    JSON.parse(
        JSON.stringify(
            parseSoqlQuery(`SELECT Id FROM Account WHERE ${clause}`),
        ),
    ).where

describe('JSON.stringify of a parsed query', () => {
    it('includes node types at every level', () => {
        const json = whereJson('X = 1')
        expect(json.type).toBe('SoqlWhereClause')
        expect(json.expr.type).toBe('SoqlEqlExpr')
        expect(json.expr.left).toEqual({ type: 'SoqlField', name: 'X' })
        expect(json.expr.right).toEqual({
            type: 'SoqlNumberLiteral',
            value: 1,
        })
    })

    it('distinguishes operators', () => {
        expect(whereJson('X = 1').expr.type).toBe('SoqlEqlExpr')
        expect(whereJson('X != 1').expr.type).toBe('SoqlNeExpr')
        expect(whereJson('X = 1 AND Y = 2').expr.type).toBe('SoqlAndExpr')
        expect(whereJson('X = 1 OR Y = 2').expr.type).toBe('SoqlOrExpr')
    })

    it('distinguishes date literals from strings', () => {
        expect(whereJson('D = TODAY').expr.right).toEqual({
            type: 'SoqlDateLiteral',
            value: 'TODAY',
        })
        expect(whereJson("D = 'TODAY'").expr.right).toEqual({
            type: 'SoqlStringLiteral',
            value: 'TODAY',
        })
    })

    it('includes the type on the query root', () => {
        const json = JSON.parse(
            JSON.stringify(parseSoqlQuery('SELECT Id FROM Account LIMIT 5')),
        )
        expect(json.type).toBe('SoqlQuery')
        expect(json.limit).toBe(5)
    })
})
