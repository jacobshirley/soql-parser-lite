import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'

const base = 'SELECT Id FROM Account'

const err = (q: string): SoqlParserError => {
    try {
        parseSoqlQuery(q)
    } catch (e) {
        return e as SoqlParserError
    }
    throw new Error(`expected "${q}" to throw`)
}

describe('parse errors', () => {
    it.each([
        `${base} WHERE X IN 'CA'`,
        `${base} WHERE X IN :ids`,
        `${base} GROUP BY ROLLUP (a, b)`,
        `${base} WHERE Name='Acme'`,
        `${base} WHERE`,
    ])('throws SoqlParserError for %s', (q) => {
        expect(err(q)).toBeInstanceOf(SoqlParserError)
    })

    it('describes structural mismatches readably, not as byte codes', () => {
        const e = err(`${base} WHERE X IN 'CA'`)
        expect(e.message).toContain("Expected '(' but got '''")
        expect(e.message).not.toMatch(/Expected 40/)
    })

    it('reports the offset of a structural mismatch', () => {
        const q = `${base} WHERE X IN 'CA'`
        const e = err(q)
        expect(e.offset).toBe(q.indexOf("'CA'"))
        expect(e.message).toContain(`(at offset ${e.offset})`)
    })

    it('never has an empty "got:" message', () => {
        for (const q of [
            `${base} WHERE X`,
            `${base} WHERE X >`,
            `${base} WHERE`,
            `${base} WHERE (`,
        ]) {
            expect(err(q).message).not.toMatch(/got:\s*(\(|$)/)
        }
        expect(err(`${base} WHERE X`).message).toContain('end of input')
    })

    it('includes an offset on keyword/operator errors', () => {
        const e = err(`${base} WHERE X ~ 5`)
        expect(typeof e.offset).toBe('number')
        expect(e.message).toMatch(/\(at offset \d+\)$/)
    })

    it('SoqlParserError without an offset keeps its message', () => {
        const e = new SoqlParserError('boom')
        expect(e.message).toBe('SOQL Parser Error: boom')
        expect(e.offset).toBeUndefined()
    })
})
