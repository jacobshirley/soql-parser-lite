import { SoqlQueryParser } from './parser'
import { SoqlQuery } from './types'

export function parseSoqlQuery(soql: string): SoqlQuery {
    const parser = new SoqlQueryParser(soql)
    parser.eof = true
    return parser.read()
}
