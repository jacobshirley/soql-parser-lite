import { SoqlQueryParser } from './parser.js'
import { SoqlQuery } from './types.js'

export function parseSoqlQuery(soql: string): SoqlQuery {
    const parser = new SoqlQueryParser(soql)
    parser.eof = true
    return parser.read()
}
