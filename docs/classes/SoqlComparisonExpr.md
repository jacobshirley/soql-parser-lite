[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlComparisonExpr

# Class: SoqlComparisonExpr\<T\>

## Extends

- [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

## Extended by

- [`SoqlInExpr`](SoqlInExpr.md)
- [`SoqlNinExpr`](SoqlNinExpr.md)
- [`SoqlEqlExpr`](SoqlEqlExpr.md)
- [`SoqlNeExpr`](SoqlNeExpr.md)
- [`SoqlLtExpr`](SoqlLtExpr.md)
- [`SoqlLeExpr`](SoqlLeExpr.md)
- [`SoqlGtExpr`](SoqlGtExpr.md)
- [`SoqlGeExpr`](SoqlGeExpr.md)
- [`SoqlLikeExpr`](SoqlLikeExpr.md)
- [`SoqlNlineExpr`](SoqlNlineExpr.md)
- [`SoqlIncludesExpr`](SoqlIncludesExpr.md)
- [`SoqlExcludesExpr`](SoqlExcludesExpr.md)

## Type Parameters

### T

`T` = [`SoqlValueExpr`](SoqlValueExpr.md)

## Constructors

### Constructor

> **new SoqlComparisonExpr**\<`T`\>(`options`): `SoqlComparisonExpr`\<`T`\>

#### Parameters

##### options

###### left

[`SoqlValueExpr`](SoqlValueExpr.md)

###### right

`T`

#### Returns

`SoqlComparisonExpr`\<`T`\>

#### Overrides

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`constructor`](SoqlBooleanExpr.md#constructor)

## Properties

### left

> **left**: [`SoqlValueExpr`](SoqlValueExpr.md)

---

### right

> **right**: `T`

## Accessors

### type

#### Get Signature

> **get** **type**(): `string`

##### Returns

`string`

#### Inherited from

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`type`](SoqlBooleanExpr.md#type)

## Methods

### fromBuffer()

> `static` **fromBuffer**(`buffer`, `allowAggregates`): `SoqlComparisonExpr`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

##### allowAggregates

`boolean` = `false`

#### Returns

`SoqlComparisonExpr`

#### Overrides

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`fromBuffer`](SoqlBooleanExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`string`): `SoqlComparisonExpr`

#### Parameters

##### string

`string`

#### Returns

`SoqlComparisonExpr`

#### Overrides

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`fromString`](SoqlBooleanExpr.md#fromstring)
