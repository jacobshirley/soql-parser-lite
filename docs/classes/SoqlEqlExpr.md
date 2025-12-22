[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlEqlExpr

# Class: SoqlEqlExpr

## Extends

- [`SoqlComparisonExpr`](SoqlComparisonExpr.md)\<[`SoqlValueExpr`](SoqlValueExpr.md)\>

## Constructors

### Constructor

> **new SoqlEqlExpr**(`options`): `SoqlEqlExpr`

#### Parameters

##### options

###### left

[`SoqlValueExpr`](SoqlValueExpr.md)

###### right

[`SoqlValueExpr`](SoqlValueExpr.md)

#### Returns

`SoqlEqlExpr`

#### Inherited from

[`SoqlComparisonExpr`](SoqlComparisonExpr.md).[`constructor`](SoqlComparisonExpr.md#constructor)

## Properties

### left

> **left**: [`SoqlValueExpr`](SoqlValueExpr.md)

#### Inherited from

[`SoqlComparisonExpr`](SoqlComparisonExpr.md).[`left`](SoqlComparisonExpr.md#left)

---

### right

> **right**: [`SoqlValueExpr`](SoqlValueExpr.md)

#### Inherited from

[`SoqlComparisonExpr`](SoqlComparisonExpr.md).[`right`](SoqlComparisonExpr.md#right)

## Accessors

### type

#### Get Signature

> **get** **type**(): `string`

##### Returns

`string`

#### Inherited from

[`SoqlComparisonExpr`](SoqlComparisonExpr.md).[`type`](SoqlComparisonExpr.md#type)

## Methods

### fromBuffer()

> `static` **fromBuffer**(`buffer`, `allowAggregates`): [`SoqlComparisonExpr`](SoqlComparisonExpr.md)

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

##### allowAggregates

`boolean` = `false`

#### Returns

[`SoqlComparisonExpr`](SoqlComparisonExpr.md)

#### Inherited from

[`SoqlComparisonExpr`](SoqlComparisonExpr.md).[`fromBuffer`](SoqlComparisonExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`string`): [`SoqlComparisonExpr`](SoqlComparisonExpr.md)

#### Parameters

##### string

`string`

#### Returns

[`SoqlComparisonExpr`](SoqlComparisonExpr.md)

#### Inherited from

[`SoqlComparisonExpr`](SoqlComparisonExpr.md).[`fromString`](SoqlComparisonExpr.md#fromstring)
