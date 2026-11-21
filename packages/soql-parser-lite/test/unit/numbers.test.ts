import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'
import { SoqlNumberLiteral } from '../../src/objects/index.js'

const base = 'SELECT Id FROM Account'
const num = (v: string) =>
    (parseSoqlQuery(`${base} WHERE X = ${v}`).where!.expr as any).right.value

describe('numeric literals', () => {
    it.each([
        ['0', 0],
        ['42', 42],
        ['-42', -42],
        ['+7', 7],
        ['3.14', 3.14],
        ['-0.5', -0.5],
        ['9007199254740991', 9007199254740991],
    ])('accepts %s', (text, expected) => {
        expect(num(text)).toBe(expected)
    })

    it.each(['0x10', '0b101', '0o7', '1e3', 'Infinity', '1.', '.5', '1_000'])(
        'rejects %s',
        (text) => {
            expect(() => parseSoqlQuery(`${base} WHERE X = ${text}`)).toThrow(
                SoqlParserError,
            )
        },
    )

    it('rejects integers that cannot be represented exactly', () => {
        expect(() => num('99999999999999999999')).toThrow(SoqlParserError)
        expect(() => SoqlNumberLiteral.fromString('9007199254740993')).toThrow(
            SoqlParserError,
        )
    })
})

describe('LIMIT and OFFSET', () => {
    it('accepts non-negative integers', () => {
        const q = parseSoqlQuery(`${base} LIMIT 10 OFFSET 0`)
        expect(q.limit).toBe(10)
        expect(q.offset).toBe(0)
        expect(parseSoqlQuery(`${base} LIMIT 0`).limit).toBe(0)
    })

    it.each([
        'LIMIT',
        'LIMIT -1',
        'LIMIT 1.5',
        'LIMIT Infinity',
        'LIMIT 0x10',
        'LIMIT 1e2',
        'LIMIT 99999999999999999999',
        'OFFSET',
        'OFFSET -2',
        'OFFSET 1.5',
        'LIMIT 5 OFFSET -2',
    ])('rejects %s', (tail) => {
        expect(() => parseSoqlQuery(`${base} ${tail}`)).toThrow(SoqlParserError)
    })
})
