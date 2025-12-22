[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlOrExpr

# Class: SoqlOrExpr

## Extends

- [`SoqlLogicalExpr`](SoqlLogicalExpr.md)

## Constructors

### Constructor

> **new SoqlOrExpr**(`options`): `SoqlOrExpr`

#### Parameters

##### options

###### left

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

###### right

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Returns

`SoqlOrExpr`

#### Inherited from

[`SoqlLogicalExpr`](SoqlLogicalExpr.md).[`constructor`](SoqlLogicalExpr.md#constructor)

## Properties

### left

> **left**: [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Inherited from

[`SoqlLogicalExpr`](SoqlLogicalExpr.md).[`left`](SoqlLogicalExpr.md#left)

---

### right

> **right**: [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Inherited from

[`SoqlLogicalExpr`](SoqlLogicalExpr.md).[`right`](SoqlLogicalExpr.md#right)

## Accessors

### type

#### Get Signature

> **get** **type**(): `string`

##### Returns

`string`

#### Inherited from

[`SoqlLogicalExpr`](SoqlLogicalExpr.md).[`type`](SoqlLogicalExpr.md#type)

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

[`SoqlLogicalExpr`](SoqlLogicalExpr.md).[`fromBuffer`](SoqlLogicalExpr.md#frombuffer)

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

[`SoqlLogicalExpr`](SoqlLogicalExpr.md).[`fromString`](SoqlLogicalExpr.md#fromstring)
