/**
 * Base error class for all SOQL parser errors.
 */
export class SoqlParserError extends Error {
    /**
     * Zero-based character offset (in UTF-8 bytes) in the input at which
     * parsing failed, when known.
     */
    offset?: number

    constructor(message: string, options?: { offset?: number }) {
        super(
            `SOQL Parser Error: ${message}` +
                (options?.offset !== undefined
                    ? ` (at offset ${options.offset})`
                    : ''),
        )
        this.name = 'SoqlParserError'
        if (options?.offset !== undefined) this.offset = options.offset
    }
}

/**
 * Error thrown when the buffer is empty and more input is needed.
 */
export class NoMoreTokensError extends SoqlParserError {}

/**
 * Error thrown when the end of file has been reached and no more items are available.
 */
export class EofReachedError extends SoqlParserError {}

/**
 * Error thrown when the buffer size limit is exceeded.
 */
export class BufferSizeExceededError extends SoqlParserError {}
