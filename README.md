# soql-parser

A TypeScript/JavaScript parser for SOQL (Salesforce Object Query Language) that converts query strings into structured objects.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/soql-parser.svg)](https://www.npmjs.com/package/soql-parser)

**[Examples](./EXAMPLES.md)** | **[Documentation](https://jacobshirley.github.io/soql-parser/v1)**

## Features

- 🔍 **Complete SOQL Support**: Parses all major SOQL clauses (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET)
- 📦 **TypeScript First**: Fully typed API with comprehensive type definitions
- 🚀 **Zero Dependencies**: Lightweight with no external runtime dependencies
- 🔄 **Streaming Support**: Can parse queries incrementally from streams
- 🎯 **Accurate**: Handles complex queries including subqueries, aggregate functions, and nested field paths
- 🛡️ **Error Handling**: Provides detailed error messages for malformed queries

## Installation

```bash
npm install soql-parser
```

Or with pnpm:

```bash
pnpm add soql-parser
```

Or with yarn:

```bash
yarn add soql-parser
```

## Quick Start

```typescript
import { parseSoqlQuery } from 'soql-parser'

// Parse a simple query
const query = parseSoqlQuery(
    'SELECT Id, Name FROM Account WHERE Status = "Active" LIMIT 10',
)

console.log(query)
// {
//   type: 'soqlQuery',
//   select: {
//     items: [
//       { type: 'field', fieldName: { parts: ['Id'] } },
//       { type: 'field', fieldName: { parts: ['Name'] } }
//     ]
//   },
//   from: { objects: [{ name: 'Account' }] },
//   where: { expr: { type: 'comparison', ... } },
//   limit: 10
// }
```

## Usage Examples

### Basic Query

```typescript
import { parseSoqlQuery } from 'soql-parser'

const query = parseSoqlQuery('SELECT Id, Name, Email FROM Contact')
```

### Query with WHERE Clause

```typescript
const query = parseSoqlQuery(
    'SELECT Id, Name FROM Account WHERE Status = "Active" AND Revenue > 1000000',
)
```

### Query with Aggregate Functions

```typescript
const query = parseSoqlQuery(
    'SELECT COUNT(Id) cnt, MAX(Amount) maxAmount FROM Opportunity GROUP BY StageName',
)
```

### Query with Subquery

```typescript
const query = parseSoqlQuery(
    'SELECT Name, (SELECT LastName FROM Contacts) FROM Account',
)
```

### Query with Date Literals

```typescript
const query = parseSoqlQuery('SELECT Id FROM Case WHERE CreatedDate = TODAY')
```

### Query with ORDER BY and LIMIT

```typescript
const query = parseSoqlQuery(
    'SELECT Id, Name, CreatedDate FROM Account ORDER BY CreatedDate DESC LIMIT 100 OFFSET 50',
)
```

### Query with Relationship Fields

```typescript
const query = parseSoqlQuery(
    'SELECT Id, Account.Name, Account.Owner.Email FROM Contact',
)
```

## API Reference

### `parseSoqlQuery(soql: string): SoqlQuery`

Parses a SOQL query string and returns a structured representation.

**Parameters:**

- `soql` - The SOQL query string to parse

**Returns:**

- `SoqlQuery` - The parsed query structure

**Throws:**

- `SoqlParserError` - If the query is invalid or malformed

### Parser Classes

For advanced usage, you can use the individual parser classes directly:

- `SoqlQueryParser` - Main parser for complete queries
- `SoqlSelectParser` - Parser for SELECT clauses
- `SoqlFromClauseParser` - Parser for FROM clauses
- `SoqlWhereClauseParser` - Parser for WHERE clauses
- `SoqlBooleanExprParser` - Parser for boolean expressions
- `SoqlGroupByClauseParser` - Parser for GROUP BY clauses
- `SoqlHavingClauseParser` - Parser for HAVING clauses
- `SoqlOrderByClauseParser` - Parser for ORDER BY clauses
- `SoqlLimitClauseParser` - Parser for LIMIT clauses
- `SoqlOffsetClauseParser` - Parser for OFFSET clauses

## Supported SOQL Features

- ✅ SELECT clause with fields, aggregate functions, and subqueries
- ✅ FROM clause with multiple objects and aliases
- ✅ WHERE clause with comparison and logical operators
- ✅ GROUP BY clause
- ✅ HAVING clause
- ✅ ORDER BY clause with ASC/DESC
- ✅ LIMIT clause
- ✅ OFFSET clause
- ✅ Date literals (TODAY, YESTERDAY, LAST_N_DAYS, etc.)
- ✅ Bind variables (:variable)
- ✅ IN operator with arrays and subqueries
- ✅ Relationship field paths (Account.Owner.Name)
- ✅ Aggregate functions (COUNT, MAX, MIN, SUM, AVG)
- ✅ Field aliases

## Type Definitions

The parser returns a fully typed `SoqlQuery` object with the following structure:

```typescript
interface SoqlQuery {
    type: 'soqlQuery'
    select: SelectClause
    from: FromClause
    where?: WhereClause
    groupBy?: GroupByClause
    having?: HavingClause
    orderBy?: OrderByClause
    limit?: number
    offset?: number
}
```

See the [full type definitions](./packages/soql-parser/src/types.ts) for more details.

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run compile

# Run tests
pnpm test

# Format code
pnpm run format

# Generate documentation
pnpm run docs:gen
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT © [Jacob Shirley](https://github.com/jacobshirley)

## Related Projects

- [Salesforce SOQL Documentation](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql.htm)

## Support

- 📚 [Documentation](https://jacobshirley.github.io/soql-parser/v1)
- 💬 [GitHub Issues](https://github.com/jacobshirley/soql-parser/issues)
- 📖 [Examples](./EXAMPLES.md)
