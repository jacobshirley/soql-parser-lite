import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'

describe('GROUP BY ROLLUP / CUBE spacing', () => {
    it.each([
        ['ROLLUP', 'ROLLUP(a, b)'],
        ['ROLLUP', 'ROLLUP (a, b)'],
        ['ROLLUP', 'ROLLUP\n(a, b)'],
        ['ROLLUP', 'ROLLUP ( a , b )'],
        ['CUBE', 'CUBE(a, b)'],
        ['CUBE', 'CUBE (a, b)'],
        ['rollup', 'rollup (a, b)'],
    ])('parses %s: %s', (fn, clause) => {
        const q = parseSoqlQuery(
            `SELECT Id FROM Account GROUP BY ${clause} LIMIT 5`,
        )
        expect(q.groupBy!.groupingFunction).toBe(fn.toUpperCase())
        expect(q.groupBy!.fields.map((f) => (f.field as any).name)).toEqual([
            'a',
            'b',
        ])
        expect(q.limit).toBe(5)
    })
})
