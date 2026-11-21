import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'

describe('select item aliases', () => {
    it.each([
        [
            'SELECT Name n, MAX(Amount) max FROM Opportunity GROUP BY Name',
            'max',
        ],
        ['SELECT Name, MAX(Amount) min FROM Opportunity GROUP BY Name', 'min'],
        ['SELECT COUNT(Id) count FROM Account', 'count'],
        ['SELECT SUM(Amount) sum FROM Opportunity', 'sum'],
        ['SELECT AVG(Amount) avg FROM Opportunity', 'avg'],
        ['SELECT Name offset FROM Account', 'offset'],
        ['SELECT Name rollup FROM Account', 'rollup'],
        ['SELECT Name distinct FROM Account', 'distinct'],
    ])('accepts %s', (q, alias) => {
        const query = parseSoqlQuery(q)
        const aliases = query.select.items.map((i) => i.alias)
        expect(aliases).toContain(alias)
        expect(query.from.objects[0].name).toMatch(/^(Opportunity|Account)$/)
    })

    it('still treats FROM and other reserved words as keywords, not aliases', () => {
        const q = parseSoqlQuery('SELECT Id, Name FROM Account')
        expect(q.select.items.map((i) => i.alias)).toEqual([
            undefined,
            undefined,
        ])
        expect(() => parseSoqlQuery('SELECT Name WHERE FROM Account')).toThrow(
            SoqlParserError,
        )
    })
})
