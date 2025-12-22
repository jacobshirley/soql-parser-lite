[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlLikeExpr

# Class: SoqlLikeExpr

## Extends

- [`SoqlComparisonExpr`](SoqlComparisonExpr.md)\<[`SoqlValueExpr`](SoqlValueExpr.md)\>

## Constructors

### Constructor

> **new SoqlLikeExpr**(`options`): `SoqlLikeExpr`

#### Parameters

##### options

###### left

[`SoqlValueExpr`](SoqlValueExpr.md)

###### right

[`SoqlValueExpr`](SoqlValueExpr.md)

#### Returns

`SoqlLikeExpr`

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
