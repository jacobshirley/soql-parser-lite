import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'
import { SoqlTypeofItem } from '../../src/objects/index.js'

describe('TYPEOF', () => {
    it('parses the reference example', () => {
        const q = parseSoqlQuery(
            'SELECT TYPEOF What WHEN Account THEN Phone ELSE Name END FROM Event',
        )
        expect(q.select.items).toHaveLength(1)
        const item = q.select.items[0].item as SoqlTypeofItem
        expect(item).toBeInstanceOf(SoqlTypeofItem)
        expect(item.field).toBe('What')
        expect(item.whens).toHaveLength(1)
        expect(item.whens[0].objectType).toBe('Account')
        expect(item.whens[0].fields.map((f) => f.name)).toEqual(['Phone'])
        expect(item.elseFields!.map((f) => f.name)).toEqual(['Name'])
        expect(q.from.objects[0].name).toBe('Event')
    })

    it('parses multiple WHEN branches, multiple fields and no ELSE', () => {
        const q = parseSoqlQuery(
            'SELECT Id, TYPEOF What WHEN Account THEN Phone, NumberOfEmployees WHEN Opportunity THEN Amount, CloseDate END, Subject FROM Event',
        )
        expect(q.select.items).toHaveLength(3)
        const item = q.select.items[1].item as SoqlTypeofItem
        expect(item.whens.map((w) => w.objectType)).toEqual([
            'Account',
            'Opportunity',
        ])
        expect(item.whens[0].fields.map((f) => f.name)).toEqual([
            'Phone',
            'NumberOfEmployees',
        ])
        expect(item.whens[1].fields.map((f) => f.name)).toEqual([
            'Amount',
            'CloseDate',
        ])
        expect(item.elseFields).toBeUndefined()
        expect((q.select.items[2].item as any).name).toBe('Subject')
    })

    it('is case-insensitive and works with WHERE', () => {
        const q = parseSoqlQuery(
            "select typeof What when Account then Phone else Name end from Event where Subject = 'x'",
        )
        expect(q.select.items[0].item).toBeInstanceOf(SoqlTypeofItem)
        expect(q.where).toBeDefined()
    })

    it('serialises with node types', () => {
        const q = parseSoqlQuery(
            'SELECT TYPEOF What WHEN Account THEN Phone END FROM Event',
        )
        expect(q.select.items[0].item.type).toBe('SoqlTypeofItem')
    })

    it.each([
        'SELECT TYPEOF What END FROM Event',
        'SELECT TYPEOF What WHEN Account THEN Phone FROM Event',
        'SELECT TYPEOF WHEN Account THEN Phone END FROM Event',
        'SELECT TYPEOF What WHEN Account Phone END FROM Event',
        'SELECT TYPEOF What WHEN Account THEN END FROM Event',
    ])('rejects malformed %s', (q) => {
        expect(() => parseSoqlQuery(q)).toThrow(SoqlParserError)
    })
})
