import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'
import { SoqlCurrencyLiteral, SoqlGtExpr } from '../../src/objects/index.js'

const where = (c: string) =>
    parseSoqlQuery(`SELECT Id FROM Account WHERE ${c}`).where!.expr as any

describe('currency literals', () => {
    it('parses USD5000', () => {
        const e = where('Amount > USD5000')
        expect(e).toBeInstanceOf(SoqlGtExpr)
        expect(e.right).toBeInstanceOf(SoqlCurrencyLiteral)
        expect(e.right.currency).toBe('USD')
        expect(e.right.amount).toBe(5000)
    })

    it('parses decimals and other currencies', () => {
        const e = where('Amount = EUR100.50')
        expect(e.right.currency).toBe('EUR')
        expect(e.right.amount).toBe(100.5)
    })

    it('normalises the code to upper case', () => {
        expect(where('Amount = gbp20').right.currency).toBe('GBP')
    })

    it('works in IN lists and with following clauses', () => {
        const q = parseSoqlQuery(
            'SELECT Id FROM Opportunity WHERE Amount IN (USD100, EUR200) LIMIT 3',
        )
        expect(
            (q.where!.expr as any).right.map(
                (v: SoqlCurrencyLiteral) => `${v.currency}${v.amount}`,
            ),
        ).toEqual(['USD100', 'EUR200'])
        expect(q.limit).toBe(3)
    })

    it('serialises with its type', () => {
        expect(where('Amount > USD5').right.type).toBe('SoqlCurrencyLiteral')
    })

    it.each(['USD', 'US5000', 'USDA5', 'USD5.', 'USD5000x'])(
        'rejects %s',
        (lit) => {
            expect(() => where(`Amount > ${lit}`)).toThrow(SoqlParserError)
        },
    )

    it('does not affect plain numbers or null/true/false', () => {
        expect(where('A = 5').right.value).toBe(5)
        expect(where('A = null').right.value).toBeNull()
        expect(where('A = true').right.value).toBe(true)
    })
})
