import { SoqlQuery } from './objects'

/**
 * Parses a SOQL query string and returns the structured query representation.
 *
 * @param soql - The SOQL query string to parse
 * @returns The parsed SOQL query structure
 * @throws SoqlParserError if the query is invalid or malformed
 *
 * @example
 * ```typescript
 * const query = parseSoqlQuery('SELECT Id, Name FROM Account WHERE Status = "Active" LIMIT 10');
 * console.log(query.select.items); // Access the selected fields
 * console.log(query.where?.expr); // Access the WHERE condition
 * ```
 */
export function parseSoqlQuery(soql: string): SoqlQuery {
    return SoqlQuery.fromString(soql)
}
