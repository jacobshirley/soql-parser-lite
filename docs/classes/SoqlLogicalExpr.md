[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlLogicalExpr

# Abstract Class: SoqlLogicalExpr

## Extends

- [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

## Extended by

- [`SoqlAndExpr`](SoqlAndExpr.md)
- [`SoqlOrExpr`](SoqlOrExpr.md)

## Constructors

### Constructor

> **new SoqlLogicalExpr**(`options`): `SoqlLogicalExpr`

#### Parameters

##### options

###### left

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

###### right

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Returns

`SoqlLogicalExpr`

#### Overrides

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`constructor`](SoqlBooleanExpr.md#constructor)

## Properties

### left

> **left**: [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

---

### right

> **right**: [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

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

> `static` **fromBuffer**(`buffer`, `allowAggregates`): [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

##### allowAggregates

`boolean` = `false`

#### Returns

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Inherited from

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`fromBuffer`](SoqlBooleanExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`string`, `allowAggregates`): [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Parameters

##### string

`string`

##### allowAggregates

`boolean` = `false`

#### Returns

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Inherited from

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`fromString`](SoqlBooleanExpr.md#fromstring)
