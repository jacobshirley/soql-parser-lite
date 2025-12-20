export class SoqlParserError extends Error {
    constructor(message: string) {
        super(`SOQL Parser Error: ${message}`)
        this.name = 'SoqlParserError'
    }
}
