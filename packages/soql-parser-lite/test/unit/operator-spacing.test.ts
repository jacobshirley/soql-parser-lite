import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import {
    SoqlEqlExpr,
    SoqlGtExpr,
    SoqlGeExpr,
    SoqlLtExpr,
    SoqlLeExpr,
    SoqlNeExpr,
    SoqlAndExpr,
} from '../../src/objects/index.js'

const where = (clause: string) =>
    parseSoqlQuery(`SELECT Id FROM Account WHERE ${clause}`).where!.expr as any

describe('operator spacing', () => {
    it.each([
        ["Name='Acme'", SoqlEqlExpr],
        ['Amount>5', SoqlGtExpr],
        ['Amount>=5', SoqlGeExpr],
        ['Amount<5', SoqlLtExpr],
        ['Amount<=5', SoqlLeExpr],
        ['Amount!=5', SoqlNeExpr],
        ["Name ='Acme'", SoqlEqlExpr],
        ["Name= 'Acme'", SoqlEqlExpr],
        ["Parent.Type='Idea'", SoqlEqlExpr],
    ])('parses %s', (clause, cls) => {
        const expr = where(clause)
        expect(expr).toBeInstanceOf(cls)
        expect(expr.left.name).toMatch(/^(Name|Amount|Parent\.Type)$/)
    })

    it('parses values correctly without spaces', () => {
        expect(where("MailingState='California'").right.value).toBe(
            'California',
        )
        expect(where('Amount>=-5').right.value).toBe(-5)
    })

    it('parses compound conditions without spaces', () => {
        const expr = where("A='x' AND B>1")
        expect(expr).toBeInstanceOf(SoqlAndExpr)
        expect(expr.right.right.value).toBe(1)
    })

    it('parses HAVING COUNT(Name)>100', () => {
        const q = parseSoqlQuery(
            'SELECT Name FROM Account GROUP BY Name HAVING COUNT(Name)>100',
        )
        const expr = q.having!.expr as any
        expect(expr).toBeInstanceOf(SoqlGtExpr)
        expect(expr.left.functionName).toBe('COUNT')
        expect(expr.right.value).toBe(100)
    })
})
