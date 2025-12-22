import { describe, expect, it } from 'vitest'
import { stringToBytes, bytesToString, bytesToNumber } from '../../src/utils'

describe('Utils', () => {
    describe('stringToBytes', () => {
        it('should convert string to bytes', () => {
            const str = 'Hello'
            const bytes = stringToBytes(str)
            expect(bytes).toBeInstanceOf(Uint8Array)
            expect(bytes.length).toBeGreaterThan(0)
        })
    })

    describe('bytesToString', () => {
        it('should convert bytes to string', () => {
            const bytes = new Uint8Array([72, 101, 108, 108, 111])
            const str = bytesToString(bytes)
            expect(str).toBe('Hello')
        })
    })

    describe('bytesToNumber', () => {
        it('should convert bytes representing a number to a number', () => {
            const bytes = stringToBytes('123')
            const num = bytesToNumber(bytes)
            expect(num).toBe(123)
        })

        it('should handle decimal numbers', () => {
            const bytes = stringToBytes('123.45')
            const num = bytesToNumber(bytes)
            expect(num).toBe(123.45)
        })

        it('should handle negative numbers', () => {
            const bytes = stringToBytes('-456')
            const num = bytesToNumber(bytes)
            expect(num).toBe(-456)
        })
    })
})
