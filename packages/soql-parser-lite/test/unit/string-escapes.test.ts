import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'

const run = (value: string) =>
    parseSoqlQuery(`SELECT Id FROM Account WHERE Name = ${value}`)
const val = (value: string) => (run(value).where!.expr as any).right.value

describe('string escape sequences', () => {
    it.each([
        ["'Bob\\'s'", "Bob's"],
        ["'a\\nb'", 'a\nb'],
        ["'a\\rb'", 'a\rb'],
        ["'a\\tb'", 'a\tb'],
        ["'a\\bb'", 'a\bb'],
        ["'a\\fb'", 'a\fb'],
        ["'a\\\"b'", 'a"b'],
        ["'a\\\\b'", 'a\\b'],
        ["'a\\\\'", 'a\\'],
    ])('decodes %s', (literal, expected) => {
        expect(val(literal)).toBe(expected)
    })

    it('keeps \\_ and \\% (LIKE escapes) verbatim', () => {
        expect(val("'50\\%'")).toBe('50\\%')
        expect(val("'a\\_b'")).toBe('a\\_b')
    })

    it.each(["'a\\qb'", "'a\\'", "'it's'", "'", "'abc"])(
        'rejects %s',
        (literal) => {
            expect(() => run(literal)).toThrow(SoqlParserError)
        },
    )

    it('rejects double-quoted strings', () => {
        expect(() => run('"Active"')).toThrow(
            /Double-quoted strings are not valid SOQL/,
        )
    })

    it('still accepts plain single-quoted strings', () => {
        expect(val("'Active'")).toBe('Active')
        expect(val("''")).toBe('')
    })
})
