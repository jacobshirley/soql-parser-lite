import { describe, expect, it } from 'vitest'
import {
    SoqlValueExpr,
    SoqlStringLiteral,
    SoqlNumberLiteral,
    SoqlBooleanLiteral,
    SoqlDateValueLiteral,
    SoqlDateLiteral,
    SoqlDateTimeLiteral,
    SoqlBindVariable,
    SoqlNullLiteral,
} from '../../src/objects/SoqlValueExpr'
import { SoqlParserError } from '../../src/errors'

describe('SoqlValueExpr', () => {
    describe('SoqlStringLiteral', () => {
        it('should parse string with single quotes', () => {
            const literal = SoqlStringLiteral.fromString("'Hello World'")
            expect(literal.value).toBe('Hello World')
        })

        it('should parse string with double quotes', () => {
            const literal = SoqlStringLiteral.fromString('"Hello World"')
            expect(literal.value).toBe('Hello World')
        })

        it('should handle string without quotes', () => {
            const literal = SoqlStringLiteral.fromString('Hello')
            expect(literal.value).toBe('Hello')
        })
    })

    describe('SoqlNumberLiteral', () => {
        it('should parse positive integer', () => {
            const literal = SoqlNumberLiteral.fromString('42')
            expect(literal.value).toBe(42)
        })

        it('should parse negative integer', () => {
            const literal = SoqlNumberLiteral.fromString('-42')
            expect(literal.value).toBe(-42)
        })

        it('should parse decimal number', () => {
            const literal = SoqlNumberLiteral.fromString('3.14')
            expect(literal.value).toBe(3.14)
        })

        it('should throw error for invalid number', () => {
            expect(() => SoqlNumberLiteral.fromString('abc')).toThrow(
                SoqlParserError,
            )
        })
    })

    describe('SoqlBooleanLiteral', () => {
        it('should parse true', () => {
            const literal = SoqlBooleanLiteral.fromString('true')
            expect(literal.value).toBe(true)
        })

        it('should parse false', () => {
            const literal = SoqlBooleanLiteral.fromString('false')
            expect(literal.value).toBe(false)
        })

        it('should handle case insensitive', () => {
            const literal1 = SoqlBooleanLiteral.fromString('TRUE')
            expect(literal1.value).toBe(true)
            const literal2 = SoqlBooleanLiteral.fromString('False')
            expect(literal2.value).toBe(false)
        })

        it('should throw error for invalid boolean', () => {
            expect(() => SoqlBooleanLiteral.fromString('yes')).toThrow(
                SoqlParserError,
            )
        })
    })

    describe('SoqlDateValueLiteral', () => {
        it('should parse valid date', () => {
            const literal = SoqlDateValueLiteral.fromString('2024-12-22')
            expect(literal.value).toBe('2024-12-22')
        })

        it('should throw error for invalid date format', () => {
            expect(() => SoqlDateValueLiteral.fromString('12/22/2024')).toThrow(
                SoqlParserError,
            )
        })

        it('should throw error for invalid date', () => {
            expect(() => SoqlDateValueLiteral.fromString('not-a-date')).toThrow(
                SoqlParserError,
            )
        })
    })

    describe('SoqlDateLiteral', () => {
        it('should parse TODAY', () => {
            const literal = SoqlDateLiteral.fromString('TODAY')
            expect(literal.value).toBe('TODAY')
        })

        it('should parse YESTERDAY', () => {
            const literal = SoqlDateLiteral.fromString('YESTERDAY')
            expect(literal.value).toBe('YESTERDAY')
        })

        it('should parse THIS_WEEK', () => {
            const literal = SoqlDateLiteral.fromString('THIS_WEEK')
            expect(literal.value).toBe('THIS_WEEK')
        })

        it('should parse LAST_N_DAYS with parameter', () => {
            const literal = SoqlDateLiteral.fromString('LAST_N_DAYS:7')
            expect(literal.value).toEqual({ type: 'LAST_N_DAYS', n: 7 })
        })

        it('should parse NEXT_N_WEEKS with parameter', () => {
            const literal = SoqlDateLiteral.fromString('NEXT_N_WEEKS:3')
            expect(literal.value).toEqual({ type: 'NEXT_N_WEEKS', n: 3 })
        })

        it('should parse more fiscal date literals', () => {
            expect(
                SoqlDateLiteral.fromString('THIS_FISCAL_QUARTER').value,
            ).toBe('THIS_FISCAL_QUARTER')
            expect(SoqlDateLiteral.fromString('LAST_FISCAL_YEAR').value).toBe(
                'LAST_FISCAL_YEAR',
            )
            expect(SoqlDateLiteral.fromString('NEXT_MONTH').value).toBe(
                'NEXT_MONTH',
            )
            expect(SoqlDateLiteral.fromString('LAST_90_DAYS').value).toBe(
                'LAST_90_DAYS',
            )
        })

        it('should parse dynamic date literals with N', () => {
            expect(SoqlDateLiteral.fromString('N_DAYS_AGO:5').value).toEqual({
                type: 'N_DAYS_AGO',
                n: 5,
            })
            expect(SoqlDateLiteral.fromString('LAST_N_MONTHS:6').value).toEqual(
                { type: 'LAST_N_MONTHS', n: 6 },
            )
            expect(
                SoqlDateLiteral.fromString('NEXT_N_QUARTERS:2').value,
            ).toEqual({ type: 'NEXT_N_QUARTERS', n: 2 })
            expect(
                SoqlDateLiteral.fromString('N_FISCAL_YEARS_AGO:3').value,
            ).toEqual({ type: 'N_FISCAL_YEARS_AGO', n: 3 })
        })

        it('should throw error for invalid date literal', () => {
            expect(() => SoqlDateLiteral.fromString('INVALID_DATE')).toThrow(
                SoqlParserError,
            )
        })

        it('should throw error for dynamic literal without valid N', () => {
            expect(() => SoqlDateLiteral.fromString('LAST_N_DAYS:abc')).toThrow(
                SoqlParserError,
            )
        })
    })

    describe('SoqlDateTimeLiteral', () => {
        it('should parse valid datetime with milliseconds', () => {
            const literal = SoqlDateTimeLiteral.fromString(
                '2024-12-22T10:30:45.123Z',
            )
            expect(literal.value).toBe('2024-12-22T10:30:45.123Z')
        })

        it('should parse valid datetime without milliseconds', () => {
            const literal = SoqlDateTimeLiteral.fromString(
                '2024-12-22T10:30:45Z',
            )
            expect(literal.value).toBe('2024-12-22T10:30:45Z')
        })

        it('should throw error for invalid datetime format', () => {
            expect(() =>
                SoqlDateTimeLiteral.fromString('2024-12-22 10:30:45'),
            ).toThrow(SoqlParserError)
        })
    })

    describe('SoqlBindVariable', () => {
        it('should parse bind variable with colon', () => {
            const literal = SoqlBindVariable.fromString(':accountName')
            expect(literal.name).toBe('accountName')
        })

        it('should parse bind variable without colon', () => {
            const literal = SoqlBindVariable.fromString('accountName')
            expect(literal.name).toBe('accountName')
        })
    })

    describe('SoqlNullLiteral', () => {
        it('should parse null', () => {
            const literal = SoqlNullLiteral.fromString('null')
            expect(literal.value).toBe(null)
        })

        it('should handle case insensitive', () => {
            const literal = SoqlNullLiteral.fromString('NULL')
            expect(literal.value).toBe(null)
        })
    })

    describe('SoqlValueExpr.fromString', () => {
        it('should detect and parse string literal', () => {
            const expr = SoqlValueExpr.fromString("'test'")
            expect(expr).toBeInstanceOf(SoqlStringLiteral)
        })

        it('should detect and parse number literal', () => {
            const expr = SoqlValueExpr.fromString('123')
            expect(expr).toBeInstanceOf(SoqlNumberLiteral)
        })

        it('should detect and parse boolean literal', () => {
            const expr = SoqlValueExpr.fromString('true')
            expect(expr).toBeInstanceOf(SoqlBooleanLiteral)
        })

        it('should detect and parse date literal', () => {
            const expr = SoqlValueExpr.fromString('TODAY')
            expect(expr).toBeInstanceOf(SoqlDateLiteral)
        })

        it('should detect and parse datetime literal via direct parsing', () => {
            const expr = SoqlDateTimeLiteral.fromString('2024-12-22T10:30:45Z')
            expect(expr).toBeInstanceOf(SoqlDateTimeLiteral)
        })

        it('should detect and parse null literal', () => {
            const expr = SoqlValueExpr.fromString('null')
            expect(expr).toBeInstanceOf(SoqlNullLiteral)
        })

        it('should throw error for unrecognized value', () => {
            expect(() => SoqlValueExpr.fromString('?invalid?')).toThrow(
                SoqlParserError,
            )
        })
    })
})
