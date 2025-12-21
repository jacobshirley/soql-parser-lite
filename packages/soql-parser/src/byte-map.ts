/**
 * Mapping of commonly used characters to their byte values for efficient parsing.
 * @internal
 */
export const BYTE_MAP = {
    space: 0x20,
    tab: 0x09,
    carriageReturn: 0x0d,
    lineFeed: 0x0a,
    comma: 0x2c,
    openParen: 0x28,
    closeParen: 0x29,
    a: 0x61,
    A: 0x41,
    n: 0x6e,
    N: 0x4e,
    d: 0x64,
    D: 0x44,
    o: 0x6f,
    O: 0x4f,
    r: 0x72,
    R: 0x52,
    s: 0x73,
    S: 0x53,
    f: 0x66,
    F: 0x46,
    m: 0x6d,
    M: 0x4d,
    t: 0x74,
    T: 0x54,
    e: 0x65,
    E: 0x45,
    l: 0x6c,
    L: 0x4c,
    c: 0x63,
    C: 0x43,
    w: 0x77,
    W: 0x57,
    h: 0x68,
    H: 0x48,
    g: 0x67,
    G: 0x47,
    i: 0x69,
    I: 0x49,
    p: 0x70,
    P: 0x50,
    u: 0x75,
    U: 0x55,
    v: 0x76,
    V: 0x56,
    b: 0x62,
    B: 0x42,
    y: 0x79,
    Y: 0x59,
}

/**
 * Checks if a byte represents a whitespace character.
 *
 * @param byte - The byte to check
 * @returns True if the byte is a space, tab, carriage return, or line feed
 */
export const isWhitespace = (byte: number | null): boolean => {
    return (
        byte === BYTE_MAP.space ||
        byte === BYTE_MAP.tab ||
        byte === BYTE_MAP.carriageReturn ||
        byte === BYTE_MAP.lineFeed
    )
}
