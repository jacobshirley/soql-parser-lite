import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'
import { SoqlWithClause } from '../../src/objects/index.js'

const base = 'SELECT Id FROM Account'

describe('NULLS FIRST / LAST', () => {
    it('parses NULLS with and without a direction', () => {
        const q = parseSoqlQuery(
            `${base} ORDER BY Name ASC NULLS FIRST, Id DESC NULLS LAST, Type NULLS LAST, Owner DESC, Other`,
        )
        const f = q.orderBy!.fields
        expect(f.map((x) => x.direction)).toEqual([
            'ASC',
            'DESC',
            null,
            'DESC',
            null,
        ])
        expect(f.map((x) => x.nulls)).toEqual([
            'FIRST',
            'LAST',
            'LAST',
            undefined,
            undefined,
        ])
    })

    it('keeps following clauses', () => {
        const q = parseSoqlQuery(
            `${base} ORDER BY Name ASC NULLS LAST LIMIT 125`,
        )
        expect(q.limit).toBe(125)
        expect(q.orderBy!.fields[0].nulls).toBe('LAST')
    })

    it('rejects NULLS without FIRST/LAST', () => {
        expect(() => parseSoqlQuery(`${base} ORDER BY Name NULLS`)).toThrow(
            SoqlParserError,
        )
        expect(() =>
            parseSoqlQuery(`${base} ORDER BY Name NULLS MIDDLE`),
        ).toThrow(SoqlParserError)
    })
})

describe('USING SCOPE', () => {
    it('parses USING SCOPE before WHERE', () => {
        const q = parseSoqlQuery(`${base} USING SCOPE mine WHERE Name = 'x'`)
        expect(q.usingScope).toBe('mine')
        expect(q.where).toBeDefined()
    })

    it('parses USING SCOPE alone and with an alias', () => {
        expect(parseSoqlQuery(`${base} a USING SCOPE Team`).usingScope).toBe(
            'Team',
        )
        expect(
            parseSoqlQuery(`${base} a USING SCOPE Team`).from.objects[0].alias,
        ).toBe('a')
    })

    it('rejects USING without SCOPE or a scope name', () => {
        expect(() => parseSoqlQuery(`${base} USING mine`)).toThrow(
            SoqlParserError,
        )
        expect(() => parseSoqlQuery(`${base} USING SCOPE`)).toThrow(
            SoqlParserError,
        )
    })
})

describe('WITH', () => {
    it.each(['SECURITY_ENFORCED', 'USER_MODE', 'SYSTEM_MODE'])(
        'parses WITH %s',
        (mode) => {
            const q = parseSoqlQuery(
                `${base} WHERE Id = 'x' WITH ${mode} LIMIT 5`,
            )
            expect(q.with).toBeInstanceOf(SoqlWithClause)
            expect(q.with!.kind).toBe(mode)
            expect(q.limit).toBe(5)
        },
    )

    it('parses WITH DATA CATEGORY with several filters and lists', () => {
        const q = parseSoqlQuery(
            "SELECT Title FROM KnowledgeArticleVersion WHERE PublishStatus = 'online' WITH DATA CATEGORY Geography__c ABOVE_OR_BELOW usa__c AND Product__c AT (a__c, b__c)",
        )
        expect(q.with!.kind).toBe('DATA_CATEGORY')
        expect(q.with!.dataCategories).toHaveLength(2)
        expect(q.with!.dataCategories![0]).toMatchObject({
            group: 'Geography__c',
            selector: 'ABOVE_OR_BELOW',
            categories: ['usa__c'],
        })
        expect(q.with!.dataCategories![1]).toMatchObject({
            group: 'Product__c',
            selector: 'AT',
            categories: ['a__c', 'b__c'],
        })
    })

    it.each([
        `${base} WITH`,
        `${base} WITH FOO`,
        `${base} WITH DATA Geography__c AT usa__c`,
        `${base} WITH DATA CATEGORY Geography__c IS usa__c`,
    ])('rejects %s', (q) => {
        expect(() => parseSoqlQuery(q)).toThrow(SoqlParserError)
    })
})

describe('FOR and UPDATE', () => {
    it.each(['VIEW', 'REFERENCE', 'UPDATE'])('parses FOR %s', (mode) => {
        const q = parseSoqlQuery(`${base} LIMIT 1 FOR ${mode}`)
        expect(q.forClause).toBe(mode)
        expect(q.from.objects[0].alias).toBeUndefined()
        expect(q.limit).toBe(1)
    })

    it('parses FOR directly after FROM without taking FOR as an alias', () => {
        const q = parseSoqlQuery(`${base} FOR VIEW`)
        expect(q.forClause).toBe('VIEW')
        expect(q.from.objects[0].alias).toBeUndefined()
    })

    it.each([
        ['UPDATE TRACKING', ['TRACKING']],
        ['UPDATE VIEWSTAT', ['VIEWSTAT']],
        ['UPDATE TRACKING, VIEWSTAT', ['TRACKING', 'VIEWSTAT']],
    ])('parses %s', (tail, expected) => {
        const q = parseSoqlQuery(`${base} ${tail}`)
        expect(q.updateClause).toEqual(expected)
    })

    it('parses FOR VIEW with UPDATE VIEWSTAT', () => {
        const q = parseSoqlQuery(`${base} FOR VIEW UPDATE VIEWSTAT`)
        expect(q.forClause).toBe('VIEW')
        expect(q.updateClause).toEqual(['VIEWSTAT'])
    })

    it.each([
        `${base} FOR`,
        `${base} FOR BOGUS`,
        `${base} UPDATE`,
        `${base} UPDATE BOGUS`,
    ])('rejects %s', (q) => {
        expect(() => parseSoqlQuery(q)).toThrow(SoqlParserError)
    })
})

describe('full clause order', () => {
    it('parses every clause together', () => {
        const q = parseSoqlQuery(
            "SELECT Id FROM Account USING SCOPE mine WHERE Name = 'x' WITH SECURITY_ENFORCED GROUP BY Name HAVING COUNT(Id) > 1 ORDER BY Name DESC NULLS LAST LIMIT 10 OFFSET 5 FOR VIEW UPDATE TRACKING",
        )
        expect(q.usingScope).toBe('mine')
        expect(q.with!.kind).toBe('SECURITY_ENFORCED')
        expect(q.groupBy).toBeDefined()
        expect(q.having).toBeDefined()
        expect(q.orderBy!.fields[0].nulls).toBe('LAST')
        expect(q.limit).toBe(10)
        expect(q.offset).toBe(5)
        expect(q.forClause).toBe('VIEW')
        expect(q.updateClause).toEqual(['TRACKING'])
    })
})
