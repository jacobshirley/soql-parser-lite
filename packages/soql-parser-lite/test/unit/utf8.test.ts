import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'

const value = (v: string) =>
    (
        parseSoqlQuery(`SELECT Id FROM Account WHERE Name = ${v}`).where!
            .expr as any
    ).right.value

describe('non-ASCII text', () => {
    it.each(["'é'", "'日本'", "'😀'", "'naïve'", "'Zoë-Ångström'"])(
        'round-trips string value %s',
        (literal) => {
            expect(value(literal)).toBe(literal.slice(1, -1))
        },
    )

    it('keeps non-ASCII field aliases and names intact', () => {
        const q = parseSoqlQuery('SELECT Näme__c FROM Account')
        expect((q.select.items[0].item as any).name).toBe('Näme__c')
    })
})
