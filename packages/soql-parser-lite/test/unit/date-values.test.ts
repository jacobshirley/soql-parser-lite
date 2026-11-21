import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import {
    SoqlDateTimeLiteral,
    SoqlDateValueLiteral,
} from '../../src/objects/index.js'

const right = (clause: string) =>
    (
        parseSoqlQuery(`SELECT Id FROM Account WHERE ${clause}`).where!
            .expr as any
    ).right

describe('date and dateTime values in queries', () => {
    it('parses YYYY-MM-DD', () => {
        const r = right('CloseDate = 1999-01-01')
        expect(r).toBeInstanceOf(SoqlDateValueLiteral)
        expect(r.value).toBe('1999-01-01')
    })

    it.each([
        '2005-10-08T01:02:03Z',
        '2005-10-08T01:02:03.123Z',
        '2005-10-08T01:02:03+01:00',
        '2005-10-08T01:02:03-08:00',
    ])('parses dateTime %s', (value) => {
        const r = right(`CreatedDate > ${value}`)
        expect(r).toBeInstanceOf(SoqlDateTimeLiteral)
        expect(r.value).toBe(value)
    })

    it('parses dates in an IN list and followed by other clauses', () => {
        const q = parseSoqlQuery(
            'SELECT Id FROM Account WHERE D IN (2020-01-01, 2020-02-01) LIMIT 3',
        )
        expect((q.where!.expr as any).right.map((v: any) => v.value)).toEqual([
            '2020-01-01',
            '2020-02-01',
        ])
        expect(q.limit).toBe(3)
    })

    it('still parses plain numbers', () => {
        expect(right('X = -5').value).toBe(-5)
        expect(right('X = 3.14').value).toBe(3.14)
    })

    it('accepts offsets in SoqlDateTimeLiteral.fromString', () => {
        expect(
            SoqlDateTimeLiteral.fromString('2005-10-08T01:02:03+01:00').value,
        ).toBe('2005-10-08T01:02:03+01:00')
    })
})
