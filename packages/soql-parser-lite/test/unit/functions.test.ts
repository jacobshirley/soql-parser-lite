import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'
import {
    SoqlAggregateField,
    SoqlFunctionCall,
    SoqlField,
    SoqlLtExpr,
    SoqlNumberLiteral,
    SoqlStringLiteral,
} from '../../src/objects/index.js'

const sel = (q: string) => parseSoqlQuery(q).select.items[0].item as any
const where = (c: string) =>
    parseSoqlQuery(`SELECT Id FROM Account WHERE ${c}`).where!.expr as any

describe('functions', () => {
    it('allows date functions in WHERE', () => {
        const e = where('CALENDAR_YEAR(CreatedDate) = 2011')
        expect(e.left).toBeInstanceOf(SoqlFunctionCall)
        expect(e.left.functionName).toBe('CALENDAR_YEAR')
        expect(e.left.args[0]).toBeInstanceOf(SoqlField)
        expect(e.right.value).toBe(2011)
    })

    it('allows toLabel in WHERE', () => {
        const e = where("toLabel(Status) = 'Draft'")
        expect(e.left).toBeInstanceOf(SoqlFunctionCall)
        expect(e.left.functionName).toBe('toLabel')
        expect(e.right.value).toBe('Draft')
    })

    it('parses multi-argument DISTANCE with nested GEOLOCATION in WHERE', () => {
        const e = where(
            "DISTANCE(Location__c, GEOLOCATION(37.775,-122.418), 'mi') < 20",
        )
        expect(e).toBeInstanceOf(SoqlLtExpr)
        const [field, geo, unit] = e.left.args
        expect(field).toBeInstanceOf(SoqlField)
        expect(geo).toBeInstanceOf(SoqlFunctionCall)
        expect(geo.args.map((a: SoqlNumberLiteral) => a.value)).toEqual([
            37.775, -122.418,
        ])
        expect(unit).toBeInstanceOf(SoqlStringLiteral)
        expect(unit.value).toBe('mi')
        expect(e.right.value).toBe(20)
    })

    it('parses nested functions in SELECT', () => {
        const a = sel('SELECT FORMAT(convertCurrency(Amount)) FROM Opportunity')
        expect(a.functionName).toBe('FORMAT')
        expect(a.args[0].functionName).toBe('convertCurrency')
        expect(a.args[0].args[0].name).toBe('Amount')

        const b = sel(
            'SELECT HOUR_IN_DAY(convertTimezone(CreatedDate)) FROM Opportunity',
        )
        expect(b.functionName).toBe('HOUR_IN_DAY')
        expect(b.args[0].functionName).toBe('convertTimezone')
    })

    it('parses functions in ORDER BY and GROUP BY', () => {
        const q = parseSoqlQuery(
            'SELECT CALENDAR_YEAR(CreatedDate), COUNT(Id) FROM Opportunity GROUP BY CALENDAR_YEAR(CreatedDate) ORDER BY CALENDAR_YEAR(CreatedDate) DESC',
        )
        expect(q.groupBy!.fields[0].field).toBeInstanceOf(SoqlFunctionCall)
        expect(q.orderBy!.fields[0].field).toBeInstanceOf(SoqlFunctionCall)
        expect(q.orderBy!.fields[0].direction).toBe('DESC')
    })

    it('keeps SoqlAggregateField for simple aggregates', () => {
        expect(sel('SELECT COUNT(Id) FROM Account')).toBeInstanceOf(
            SoqlAggregateField,
        )
        expect(sel('SELECT max(Amount) FROM Opportunity').field.name).toBe(
            'Amount',
        )
    })

    it('supports COUNT() with no argument', () => {
        const c = sel('SELECT COUNT() FROM Account')
        expect(c).toBeInstanceOf(SoqlFunctionCall)
        expect(c.args).toEqual([])
    })

    it('still rejects aggregates in WHERE but allows them in HAVING', () => {
        expect(() => where('COUNT(Id) > 1')).toThrow(
            /Aggregate functions are not allowed/,
        )
        expect(() =>
            parseSoqlQuery(
                'SELECT Name FROM Account GROUP BY Name HAVING COUNT(Id) > 1',
            ),
        ).not.toThrow()
    })

    it('rejects unknown functions and COUNT(*)', () => {
        expect(() => parseSoqlQuery('SELECT FOO(Id) FROM Account')).toThrow(
            /Unknown function: FOO/,
        )
        expect(() => parseSoqlQuery('SELECT COUNT(*) FROM Account')).toThrow(
            SoqlParserError,
        )
    })
})
