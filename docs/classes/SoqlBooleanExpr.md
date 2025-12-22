[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlBooleanExpr

# Abstract Class: SoqlBooleanExpr

## Extends

- [`SoqlBase`](SoqlBase.md)

## Extended by

- [`SoqlComparisonExpr`](SoqlComparisonExpr.md)
- [`SoqlLogicalExpr`](SoqlLogicalExpr.md)
- [`SoqlParenExpr`](SoqlParenExpr.md)

## Constructors

### Constructor

> **new SoqlBooleanExpr**(): `SoqlBooleanExpr`

#### Returns

`SoqlBooleanExpr`

#### Inherited from

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Accessors

### type

#### Get Signature

> **get** **type**(): `string`

##### Returns

`string`

#### Inherited from

[`SoqlBase`](SoqlBase.md).[`type`](SoqlBase.md#type)

## Methods

### fromBuffer()

> `static` **fromBuffer**(`buffer`, `allowAggregates`): `SoqlBooleanExpr`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

##### allowAggregates

`boolean` = `false`

#### Returns

`SoqlBooleanExpr`

---

### fromString()

> `static` **fromString**(`string`, `allowAggregates`): `SoqlBooleanExpr`

#### Parameters

##### string

`string`

##### allowAggregates

`boolean` = `false`

#### Returns

`SoqlBooleanExpr`
