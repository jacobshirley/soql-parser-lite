/**
 * @packageDocumentation
 * SOQL (Salesforce Object Query Language) Parser
 *
 * This package provides a parser for SOQL queries, converting query strings into
 * structured TypeScript objects. It supports all major SOQL clauses including
 * SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, and OFFSET.
 *
 * @example
 * ```typescript
 * import { parseSoqlQuery } from 'soql-parser';
 *
 * const query = parseSoqlQuery('SELECT Id, Name FROM Account WHERE Status = "Active" LIMIT 10');
 * console.log(query);
 * ```
 */

export * from './types.js'
export * from './objects/index.js'
export * from './helpers.js'
