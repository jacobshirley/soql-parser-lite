import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'
import { SoqlDateLiteral } from '../../src/objects/index.js'

const parse = (lit: string) =>
    (
        parseSoqlQuery(`SELECT Id FROM Account WHERE D = ${lit}`).where!
            .expr as any
    ).right

describe('date literals', () => {
    it('supports N_FISCAL_QUARTERS_AGO', () => {
        const r = parse('N_FISCAL_QUARTERS_AGO:2')
        expect(r).toBeInstanceOf(SoqlDateLiteral)
        expect(r.value).toEqual({ type: 'N_FISCAL_QUARTERS_AGO', n: 2 })
    })

    it('is case-insensitive and normalises to upper case', () => {
        expect(parse('today').value).toBe('TODAY')
        expect(parse('Last_Week').value).toBe('LAST_WEEK')
        expect(parse('last_n_days:7').value).toEqual({
            type: 'LAST_N_DAYS',
            n: 7,
        })
    })

    it('still parses the standard forms', () => {
        expect(parse('TODAY').value).toBe('TODAY')
        expect(parse('LAST_N_DAYS:30').value).toEqual({
            type: 'LAST_N_DAYS',
            n: 30,
        })
        expect(parse('NEXT_N_FISCAL_YEARS:0').value).toEqual({
            type: 'NEXT_N_FISCAL_YEARS',
            n: 0,
        })
    })

    it.each([
        'LAST_N_DAYS:',
        'LAST_N_DAYS:-3',
        'LAST_N_DAYS:1.5',
        'LAST_N_DAYS:abc',
        'LAST_N_DAYS_FOO:3',
        'LAST_N_DAYS',
        'TODAYS',
    ])('rejects malformed %s', (lit) => {
        expect(() => parse(lit)).toThrow(SoqlParserError)
    })

    it('SoqlDateLiteral.fromString applies the same rules', () => {
        expect(SoqlDateLiteral.fromString('yesterday').value).toBe('YESTERDAY')
        expect(() => SoqlDateLiteral.fromString('LAST_N_DAYS:-3')).toThrow(
            SoqlParserError,
        )
    })
})
