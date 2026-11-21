import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlInExpr } from '../../src/objects/index.js'

const where = (clause: string) =>
    parseSoqlQuery(`SELECT Id FROM Account WHERE ${clause}`).where!.expr as any

describe('string literals', () => {
    it.each([
        ["Name = 'Acme Corp'", 'Acme Corp'],
        ["Name = 'a,b'", 'a,b'],
        ["Name = 'a(b)'", 'a(b)'],
        ["Name = ' padded '", ' padded '],
        ["Name = ''", ''],
    ])('parses %s', (clause, expected) => {
        expect(where(clause).right.value).toBe(expected)
    })

    it('parses multiple strings with spaces in an IN list', () => {
        const expr = where("State IN ('New York', 'California')")
        expect(expr).toBeInstanceOf(SoqlInExpr)
        expect(expr.right.map((v: any) => v.value)).toEqual([
            'New York',
            'California',
        ])
    })

    it('parses a string with spaces followed by more clauses', () => {
        const q = parseSoqlQuery(
            "SELECT Id FROM Opportunity WHERE StageName = 'Closed Lost' LIMIT 5",
        )
        expect((q.where!.expr as any).right.value).toBe('Closed Lost')
        expect(q.limit).toBe(5)
    })

    it('keeps a backslash-escaped quote inside the string', () => {
        expect(where("Name = 'Bob\\'s Bar'").right.value).toBe("Bob\\'s Bar")
    })

    it('rejects an unterminated string', () => {
        expect(() =>
            parseSoqlQuery("SELECT Id FROM Account WHERE Name = 'abc"),
        ).toThrow(/Unterminated string/)
    })
})
