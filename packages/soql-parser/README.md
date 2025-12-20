# soql-parser

A TypeScript/JavaScript parser for SOQL (Salesforce Object Query Language).

## Installation

```bash
npm install soql-parser
```

## Usage

```typescript
import { parseSoqlQuery } from 'soql-parser'

const query = parseSoqlQuery(
    'SELECT Id, Name FROM Account WHERE Status = "Active" LIMIT 10',
)
console.log(query)
```

For detailed documentation, examples, and API reference, see the [main README](../../README.md) or visit the [documentation site](https://jacobshirley.github.io/soql-parser/v1).
