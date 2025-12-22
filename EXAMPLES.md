# soql-parser-lite Examples

This directory contains example scripts demonstrating how to use the soql-parser-lite library.

## Basic usage example for soql-parser-lite

```typescript
/**
 * This example demonstrates common SOQL parsing scenarios including:
 * - Simple SELECT queries
 * - WHERE clauses with conditions
 * - Aggregate functions with GROUP BY
 * - Subqueries
 * - ORDER BY and LIMIT
 * - Date literals
 */

import { parseSoqlQuery } from 'soql-parser-lite'

// Example 1: Simple SELECT query
console.log('Example 1: Simple SELECT query')
console.log('='.repeat(50))
const simpleQuery = parseSoqlQuery('SELECT Id, Name, Email FROM Contact')
console.log('Query:', 'SELECT Id, Name, Email FROM Contact')
console.log('Parsed:', JSON.stringify(simpleQuery, null, 2))
console.log()

// Example 2: Query with WHERE clause
console.log('Example 2: Query with WHERE clause')
console.log('='.repeat(50))
const whereQuery = parseSoqlQuery(
    'SELECT Id, Name FROM Account WHERE Status = "Active" AND AnnualRevenue > 1000000',
)
console.log(
    'Query:',
    'SELECT Id, Name FROM Account WHERE Status = "Active" AND AnnualRevenue > 1000000',
)
console.log('WHERE clause type:', JSON.stringify(whereQuery.where, null, 2))
console.log()

// Example 3: Aggregate functions with GROUP BY
console.log('Example 3: Aggregate functions with GROUP BY')
console.log('='.repeat(50))
const aggregateQuery = parseSoqlQuery(
    'SELECT COUNT(Id) cnt, StageName, MAX(Amount) maxAmount FROM Opportunity GROUP BY StageName',
)
console.log(
    'Query:',
    'SELECT COUNT(Id) cnt, StageName, MAX(Amount) maxAmount FROM Opportunity GROUP BY StageName',
)
console.log(
    'Select items:',
    aggregateQuery.select.items.map((item) => item.item.type),
)
console.log('Has GROUP BY:', !!aggregateQuery.groupBy)
console.log()

// Example 4: Query with subquery
console.log('Example 4: Query with subquery')
console.log('='.repeat(50))
const subqueryQuery = parseSoqlQuery(
    'SELECT Id, Name, (SELECT FirstName, LastName FROM Contacts WHERE IsActive = true) FROM Account',
)
console.log(
    'Query:',
    'SELECT Id, Name, (SELECT FirstName, LastName FROM Contacts WHERE IsActive = true) FROM Account',
)
console.log(
    'Has subquery:',
    subqueryQuery.select.items.some((item) => item.type === 'subquery'),
)
console.log()

// Example 5: Date literals
console.log('Example 5: Date literals')
console.log('='.repeat(50))
const dateQuery = parseSoqlQuery(
    'SELECT Id, Subject FROM Case WHERE CreatedDate = TODAY AND Status != "Closed"',
)
console.log(
    'Query:',
    'SELECT Id, Subject FROM Case WHERE CreatedDate = TODAY AND Status != "Closed"',
)
console.log('Has WHERE clause:', !!dateQuery.where)
console.log()

// Example 6: ORDER BY and LIMIT
console.log('Example 6: ORDER BY and LIMIT')
console.log('='.repeat(50))
const sortedQuery = parseSoqlQuery(
    'SELECT Id, Name, CreatedDate FROM Account ORDER BY CreatedDate DESC, Name ASC LIMIT 100',
)
console.log(
    'Query:',
    'SELECT Id, Name, CreatedDate FROM Account ORDER BY CreatedDate DESC, Name ASC LIMIT 100',
)
console.log('ORDER BY fields:', sortedQuery.orderBy?.fields.length)
console.log('LIMIT:', sortedQuery.limit)
console.log()

// Example 7: Complex nested field paths
console.log('Example 7: Complex nested field paths')
console.log('='.repeat(50))
const nestedQuery = parseSoqlQuery(
    'SELECT Id, Account.Name, Account.Owner.Email FROM Opportunity',
)
console.log(
    'Query:',
    'SELECT Id, Account.Name, Account.Owner.Email FROM Opportunity',
)
console.log(
    'Field paths:',
    nestedQuery.select.items
        .filter((item) => item.type === 'field')
        .map((item) => (item as any).fieldName.parts.join('.')),
)
console.log()

// Example 8: HAVING clause with aggregates
console.log('Example 8: HAVING clause with aggregates')
console.log('='.repeat(50))
const havingQuery = parseSoqlQuery(
    'SELECT LeadSource, COUNT(Id) cnt FROM Lead GROUP BY LeadSource HAVING COUNT(Id) > 10',
)
console.log(
    'Query:',
    'SELECT LeadSource, COUNT(Id) cnt FROM Lead GROUP BY LeadSource HAVING COUNT(Id) > 10',
)
console.log('Has HAVING clause:', !!havingQuery.having)
console.log()

console.log('All examples completed successfully! ✓')
```
