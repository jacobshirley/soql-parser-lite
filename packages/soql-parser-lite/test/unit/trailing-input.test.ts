import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'

const base = 'SELECT Id FROM Account'

describe('unparsed trailing input', () => {
    it.each([
        'ORDER BY Name ASC NULLS LAST LIMIT 125',
        'ORDER BY Name ASC NULLS FIRST, Id DESC NULLS LAST',
        'USING SCOPE mine WHERE X = 1',
        'OFFSET 5 LIMIT 10',
        'LIMIT 10 LIMIT 20',
        'LIMIT 10 garbage here',
        'WHERE X = 1 )',
        'WHERE A = 1 B = 2',
        'WHERE X = 1 WHERE Y = 2',
        'WHERE X = 1 // c',
        'WITH SECURITY_ENFORCED',
        'FOR VIEW',
        'FOR UPDATE',
        'garbage here',
    ])('rejects "%s"', (tail) => {
        expect(() => parseSoqlQuery(`${base} ${tail}`)).toThrow(SoqlParserError)
    })

    it('reports the leftover text', () => {
        expect(() => parseSoqlQuery(`${base} LIMIT 10 garbage here`)).toThrow(
            /garbage here/,
        )
    })

    it.each([
        base,
        `${base}  `,
        `${base}\n`,
        `${base} a`,
        `${base} WHERE X = 1 ORDER BY Name LIMIT 10 OFFSET 5\n`,
        `${base} WHERE Id IN (SELECT AccountId FROM Contact)`,
    ])('still accepts valid query %j', (q) => {
        expect(() => parseSoqlQuery(q)).not.toThrow()
    })
})
