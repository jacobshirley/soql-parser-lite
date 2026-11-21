import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { ByteBuffer } from '../../src/byte-buffer'
import { SoqlParserError } from '../../src/errors'
import { SoqlQuery } from '../../src/objects/SoqlQuery'
import { SoqlStringBuffer } from '../../src/objects/core/SoqlStringBuffer'

describe('truncated queries', () => {
    it.each([
        'SELECT Id FROM Account WHERE (X = 5',
        'SELECT Id FROM Account WHERE X IN (1, 2',
        'SELECT Id FROM Account WHERE X IN',
        'SELECT Id FROM Account GROUP BY ROLLUP(a',
        'SELECT Id FROM Account WHERE Id IN (SELECT Id FROM Contact',
    ])('throws SoqlParserError (not RangeError) for %s', (q) => {
        expect(() => parseSoqlQuery(q)).toThrow(SoqlParserError)
    })
})

describe('ByteBuffer at end of input', () => {
    it('throws EofReachedError instead of recursing when the source is exhausted', () => {
        const buffer = new ByteBuffer('ab')
        expect(buffer.next()).toBe(97)
        expect(buffer.next()).toBe(98)
        expect(() => buffer.next()).toThrow(SoqlParserError)
        expect(() => buffer.next()).toThrow(SoqlParserError)
        expect(buffer.peek()).toBeNull()
    })

    it('does not re-read an array source from the start', () => {
        const buffer = new ByteBuffer(['SELECT Id FROM A WHERE (X = 1'])
        const sb = new SoqlStringBuffer('')
        sb.buffer = buffer
        expect(() => SoqlQuery.fromBuffer(sb)).toThrow(SoqlParserError)
        expect(buffer.length).toBe('SELECT Id FROM A WHERE (X = 1'.length)
    })

    it('reads chunked array input once', () => {
        const buffer = new ByteBuffer(['SEL', 'ECT'])
        const bytes: number[] = []
        for (let i = 0; i < 6; i++) bytes.push(buffer.next())
        expect(String.fromCharCode(...bytes)).toBe('SELECT')
        expect(buffer.peek()).toBeNull()
    })
})
