import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'
import { SoqlBindVariable, SoqlInExpr } from '../../src/objects/index.js'

const base = 'SELECT Id FROM Account'

describe('bind variables', () => {
    it('parses IN :ids', () => {
        const q = parseSoqlQuery(`${base} WHERE X IN :ids`)
        const e = q.where!.expr as SoqlInExpr
        expect(e).toBeInstanceOf(SoqlInExpr)
        expect(e.right).toBeInstanceOf(SoqlBindVariable)
        expect((e.right as SoqlBindVariable).name).toBe('ids')
    })

    it('parses IN :ids followed by more conditions and clauses', () => {
        const q = parseSoqlQuery(
            `${base} WHERE X IN :ids AND (Y IN :other) LIMIT 5`,
        )
        expect(q.limit).toBe(5)
        const and = q.where!.expr as any
        expect(and.left.right.name).toBe('ids')
        expect(and.right.expr.right.name).toBe('other')
    })

    it('parses LIMIT :n and OFFSET :m', () => {
        const q = parseSoqlQuery(`${base} LIMIT :lim OFFSET :off`)
        expect(q.limit).toBeInstanceOf(SoqlBindVariable)
        expect((q.limit as SoqlBindVariable).name).toBe('lim')
        expect((q.offset as SoqlBindVariable).name).toBe('off')
    })

    it('parses LIMIT :n alone', () => {
        const q = parseSoqlQuery(`${base} WHERE X = 1 LIMIT :n`)
        expect((q.limit as SoqlBindVariable).name).toBe('n')
    })

    it('still parses lists, subqueries and numeric limits', () => {
        const q = parseSoqlQuery(
            `${base} WHERE X IN (:a, :b) AND Y IN (SELECT Id FROM C) LIMIT 10 OFFSET 2`,
        )
        expect(q.limit).toBe(10)
        expect(q.offset).toBe(2)
    })

    it('still rejects a non-bind, non-list value after IN', () => {
        expect(() => parseSoqlQuery(`${base} WHERE X IN 'CA'`)).toThrow()
    })

    it('rejects an invalid LIMIT value', () => {
        expect(() => parseSoqlQuery(`${base} LIMIT abc`)).toThrow(
            SoqlParserError,
        )
    })
})
