/**
 * Base error class for all SOQL parser errors.
 */
export class SoqlParserError extends Error {
    constructor(message: string) {
        super(`SOQL Parser Error: ${message}`)
        this.name = 'SoqlParserError'
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
