/**
 * Encoder for converting strings to UTF-8 byte arrays.
 * @internal
 */
const textEncoder = new TextEncoder()

/**
 * Decoder for converting UTF-8 byte arrays to strings.
 * @internal
 */
const textDecoder = new TextDecoder()

/**
 * Converts a string to a Uint8Array of UTF-8 encoded bytes.
 *
 * @param str - The string to convert
 * @returns A Uint8Array containing the UTF-8 encoded bytes
 */
export function stringToBytes(str: string): Uint8Array {
    return textEncoder.encode(str)
}

/**
 * Converts a Uint8Array of UTF-8 encoded bytes to a string.
 *
 * @param bytes - The Uint8Array to decode
 * @returns The decoded string
 */
export function bytesToString(bytes: Uint8Array): string {
    return textDecoder.decode(bytes)
}

/**
 * Converts a Uint8Array of UTF-8 encoded bytes to a number.
 *
 * @param bytes - The Uint8Array representing a numeric string
 * @returns The parsed number value
 */
export function bytesToNumber(bytes: Uint8Array): number {
    const str = bytesToString(bytes)
    return Number(str)
}

/**
 * Parses a SOQL numeric literal: an optional sign, digits and an optional
 * decimal part. Hex/binary/octal, exponents, `Infinity` and the empty string
 * (all accepted by `Number()`) are rejected, as are integers too large to be
 * represented exactly.
 *
 * @returns The number, or `undefined` if the text is not a valid SOQL number
 * @internal
 */
export function parseSoqlNumber(text: string): number | undefined {
    if (!/^[+-]?\d+(\.\d+)?$/.test(text)) return undefined
    const value = Number(text)
    if (!/\./.test(text) && !Number.isSafeInteger(value)) return undefined
    return value
}

/**
 * Parses the non-negative integer used by LIMIT and OFFSET.
 *
 * @returns The integer, or `undefined` if the text is not one
 * @internal
 */
export function parseNonNegativeInteger(text: string): number | undefined {
    if (!/^\d+$/.test(text)) return undefined
    const value = Number(text)
    return Number.isSafeInteger(value) ? value : undefined
}
