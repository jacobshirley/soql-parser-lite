[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / parseSoqlQuery

# Function: parseSoqlQuery()

> **parseSoqlQuery**(`soql`): [`SoqlQuery`](../classes/SoqlQuery.md)

Parses a SOQL query string and returns the structured query representation.

## Parameters

### soql

`string`

The SOQL query string to parse

## Returns

[`SoqlQuery`](../classes/SoqlQuery.md)

The parsed SOQL query structure

## Throws

SoqlParserError if the query is invalid or malformed

## Example

```typescript
const query = parseSoqlQuery(
    'SELECT Id, Name FROM Account WHERE Status = "Active" LIMIT 10',
)
console.log(query.select.items) // Access the selected fields
console.log(query.where?.expr) // Access the WHERE condition
```
