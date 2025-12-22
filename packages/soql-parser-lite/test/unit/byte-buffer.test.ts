import { describe, expect, it } from 'vitest'
import { ByteBuffer } from '../../src/byte-buffer'
import {
    BufferSizeExceededError,
    EofReachedError,
    NoMoreTokensError,
} from '../../src/errors'

describe('ByteBuffer', () => {
    describe('constructor and feed', () => {
        it('should create empty buffer', () => {
            const buffer = new ByteBuffer()
            expect(buffer.length).toBe(0)
            expect(buffer.eof).toBe(false)
        })

        it('should feed string input', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hello')
            expect(buffer.length).toBeGreaterThan(0)
        })

        it('should feed array of numbers', () => {
            const buffer = new ByteBuffer()
            buffer.feed([72, 101, 108, 108, 111])
            expect(buffer.length).toBe(5)
        })

        it('should feed Uint8Array', () => {
            const buffer = new ByteBuffer()
            const bytes = new Uint8Array([72, 101, 108, 108, 111])
            buffer.feed(bytes)
            expect(buffer.length).toBe(5)
        })

        it('should feed single byte', () => {
            const buffer = new ByteBuffer()
            buffer.feed(72)
            expect(buffer.length).toBe(1)
        })
    })

    describe('peek', () => {
        it('should peek at current position', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            buffer.eof = true
            const byte = buffer.peek()
            expect(byte).toBe(72) // 'H'
        })

        it('should peek ahead', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            buffer.eof = true
            const byte = buffer.peek(1)
            expect(byte).toBe(105) // 'i'
        })

        it('should return null when peeking past EOF', () => {
            const buffer = new ByteBuffer()
            buffer.feed('H')
            buffer.eof = true
            const byte = buffer.peek(5)
            expect(byte).toBe(null)
        })
    })

    describe('next', () => {
        it('should consume and return next byte', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            buffer.eof = true
            const byte = buffer.next()
            expect(byte).toBe(72) // 'H'
            expect(buffer.position).toBe(1)
        })

        it('should throw EofReachedError at end of buffer', () => {
            const buffer = new ByteBuffer()
            buffer.feed('H')
            buffer.eof = true
            buffer.next()
            expect(() => buffer.next()).toThrow(EofReachedError)
        })
    })

    describe('expect', () => {
        it('should consume and validate expected byte', () => {
            const buffer = new ByteBuffer()
            buffer.feed('H')
            buffer.eof = true
            const byte = buffer.expect(72)
            expect(byte).toBe(72)
        })

        it('should throw error for unexpected byte', () => {
            const buffer = new ByteBuffer()
            buffer.feed('H')
            buffer.eof = true
            expect(() => buffer.expect(73)).toThrow()
        })

        it('should accept any of multiple expected bytes', () => {
            const buffer = new ByteBuffer()
            buffer.feed('H')
            buffer.eof = true
            const byte = buffer.expect(72, 73, 74)
            expect(byte).toBe(72)
        })
    })

    describe('atEof', () => {
        it('should return false when buffer has data', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            buffer.eof = true
            expect(buffer.atEof()).toBe(false)
        })

        it('should return true when buffer exhausted and EOF', () => {
            const buffer = new ByteBuffer()
            buffer.feed('H')
            buffer.eof = true
            buffer.next()
            expect(buffer.atEof()).toBe(true)
        })

        it('should return false when buffer exhausted but not EOF', () => {
            const buffer = new ByteBuffer()
            buffer.feed('H')
            buffer.next()
            expect(buffer.atEof()).toBe(false)
        })
    })

    describe('compact', () => {
        it('should remove consumed bytes from buffer', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hello')
            buffer.eof = true
            buffer.next()
            buffer.next()
            const lengthBefore = buffer.length
            buffer.compact()
            expect(buffer.length).toBeLessThan(lengthBefore)
            expect(buffer.position).toBe(0)
        })

        it('should not compact when locked', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hello')
            buffer.eof = true
            buffer.next()
            buffer.next()
            buffer.locked = true
            const positionBefore = buffer.position
            buffer.compact()
            expect(buffer.position).toBe(positionBefore)
        })
    })

    describe('resetOnFail', () => {
        it('should preserve position on NoMoreTokensError', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            buffer.eof = true
            const startPos = buffer.position
            const result = buffer.resetOnFail(() => {
                buffer.next()
                throw new NoMoreTokensError('Test error')
            })
            expect(result).toBeUndefined()
            expect(buffer.position).toBe(startPos)
        })

        it('should return result on success', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            buffer.eof = true
            const result = buffer.resetOnFail(() => {
                return 'success'
            })
            expect(result).toBe('success')
        })

        it('should call onFail callback on failure', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            let callbackCalled = false
            buffer.resetOnFail(
                () => {
                    throw new NoMoreTokensError('Test')
                },
                () => {
                    callbackCalled = true
                },
            )
            expect(callbackCalled).toBe(true)
        })

        it('should rethrow non-NoMoreTokensError errors', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            expect(() =>
                buffer.resetOnFail(() => {
                    throw new Error('Different error')
                }),
            ).toThrow('Different error')
        })
    })

    describe('push with size limits', () => {
        it('should throw BufferSizeExceededError when limit exceeded', () => {
            const buffer = new ByteBuffer()
            buffer.maxBufferSize = 5
            buffer.allowBufferToBeExceeded = false
            buffer.feed([1, 2, 3, 4, 5])
            expect(() => buffer.push(6)).toThrow(BufferSizeExceededError)
        })

        it('should allow exceeding buffer size when allowed', () => {
            const buffer = new ByteBuffer()
            buffer.maxBufferSize = 5
            buffer.allowBufferToBeExceeded = true
            buffer.feed([1, 2, 3, 4, 5, 6])
            expect(buffer.length).toBe(6)
        })
    })

    describe('toString', () => {
        it('should return string representation', () => {
            const buffer = new ByteBuffer()
            buffer.feed('Hi')
            const str = buffer.toString()
            expect(str).toContain('ByteBuffer')
            expect(str).toContain('buffer:')
        })
    })
})
