[**soql-parser-lite**](README.md)

---

# soql-parser-lite

SOQL (Salesforce Object Query Language) Parser

This package provides a parser for SOQL queries, converting query strings into
structured TypeScript objects. It supports all major SOQL clauses including
SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, and OFFSET.

## Example

```typescript
import { parseSoqlQuery } from 'soql-parser-lite'

const query = parseSoqlQuery(
    'SELECT Id, Name FROM Account WHERE Status = "Active" LIMIT 10',
)
console.log(query)
```

## Classes

- [SoqlAggregateField](classes/SoqlAggregateField.md)
- [SoqlAndExpr](classes/SoqlAndExpr.md)
- [SoqlBase](classes/SoqlBase.md)
- [SoqlBindVariable](classes/SoqlBindVariable.md)
- [SoqlBooleanExpr](classes/SoqlBooleanExpr.md)
- [SoqlBooleanLiteral](classes/SoqlBooleanLiteral.md)
- [SoqlComparisonExpr](classes/SoqlComparisonExpr.md)
- [SoqlDateLiteral](classes/SoqlDateLiteral.md)
- [SoqlDateTimeLiteral](classes/SoqlDateTimeLiteral.md)
- [SoqlDateValueLiteral](classes/SoqlDateValueLiteral.md)
- [SoqlEqlExpr](classes/SoqlEqlExpr.md)
- [SoqlExcludesExpr](classes/SoqlExcludesExpr.md)
- [SoqlField](classes/SoqlField.md)
- [SoqlFromClause](classes/SoqlFromClause.md)
- [SoqlFromObject](classes/SoqlFromObject.md)
- [SoqlGeExpr](classes/SoqlGeExpr.md)
- [SoqlGroupByClause](classes/SoqlGroupByClause.md)
- [SoqlGroupByField](classes/SoqlGroupByField.md)
- [SoqlGtExpr](classes/SoqlGtExpr.md)
- [SoqlHavingClause](classes/SoqlHavingClause.md)
- [SoqlIncludesExpr](classes/SoqlIncludesExpr.md)
- [SoqlInExpr](classes/SoqlInExpr.md)
- [SoqlLeExpr](classes/SoqlLeExpr.md)
- [SoqlLikeExpr](classes/SoqlLikeExpr.md)
- [SoqlLimitClause](classes/SoqlLimitClause.md)
- [SoqlLogicalExpr](classes/SoqlLogicalExpr.md)
- [SoqlLtExpr](classes/SoqlLtExpr.md)
- [SoqlNeExpr](classes/SoqlNeExpr.md)
- [SoqlNinExpr](classes/SoqlNinExpr.md)
- [SoqlNlineExpr](classes/SoqlNlineExpr.md)
- [SoqlNullLiteral](classes/SoqlNullLiteral.md)
- [SoqlNumberLiteral](classes/SoqlNumberLiteral.md)
- [SoqlOffsetClause](classes/SoqlOffsetClause.md)
- [SoqlOrderByClause](classes/SoqlOrderByClause.md)
- [SoqlOrderByField](classes/SoqlOrderByField.md)
- [SoqlOrExpr](classes/SoqlOrExpr.md)
- [SoqlParenExpr](classes/SoqlParenExpr.md)
- [SoqlQuery](classes/SoqlQuery.md)
- [SoqlSelectClause](classes/SoqlSelectClause.md)
- [SoqlSelectItem](classes/SoqlSelectItem.md)
- [SoqlStringBuffer](classes/SoqlStringBuffer.md)
- [SoqlStringLiteral](classes/SoqlStringLiteral.md)
- [SoqlSubquery](classes/SoqlSubquery.md)
- [SoqlValueExpr](classes/SoqlValueExpr.md)
- [SoqlWhereClause](classes/SoqlWhereClause.md)

## Type Aliases

- [ByteStream](type-aliases/ByteStream.md)
- [SoqlKeyword](type-aliases/SoqlKeyword.md)
- [SoqlOperator](type-aliases/SoqlOperator.md)
- [StreamInput](type-aliases/StreamInput.md)

## Variables

- [DATE_LITERALS](variables/DATE_LITERALS.md)
- [DATE_LITERALS_DYNAMIC](variables/DATE_LITERALS_DYNAMIC.md)
- [OPERATORS](variables/OPERATORS.md)
- [SOQL_KEYWORDS](variables/SOQL_KEYWORDS.md)

## Functions

- [parseSoqlQuery](functions/parseSoqlQuery.md)
