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
 * Words that start or structure a clause and so can never be a field or object
 * name. `DISTINCT` is included because SOQL has no `SELECT DISTINCT`.
 * @internal
 */
const NON_IDENTIFIER_WORDS = new Set([
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP',
    'HAVING',
    'ORDER',
    'LIMIT',
    'AND',
    'OR',
    'NOT',
    'DISTINCT',
])

/**
 * Whether text is a valid SOQL identifier: letters, digits and underscores
 * (not starting with a digit), optionally dot-separated for relationships
 * (`Account.Owner.Name`), and not a clause keyword.
 * @internal
 */
export function isValidIdentifier(text: string): boolean {
    return (
        /^[\p{L}_][\p{L}\p{N}_]*(\.[\p{L}_][\p{L}\p{N}_]*)*$/u.test(text) &&
        !NON_IDENTIFIER_WORDS.has(text.toUpperCase())
    )
}
