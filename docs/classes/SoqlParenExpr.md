[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlParenExpr

# Class: SoqlParenExpr

## Extends

- [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

## Constructors

### Constructor

> **new SoqlParenExpr**(`expr`): `SoqlParenExpr`

#### Parameters

##### expr

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Returns

`SoqlParenExpr`

#### Overrides

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`constructor`](SoqlBooleanExpr.md#constructor)

## Properties

### expr

> **expr**: [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

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

> `static` **fromBuffer**(`buffer`, `allowAggregates`): `SoqlParenExpr`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

##### allowAggregates

`boolean` = `false`

#### Returns

`SoqlParenExpr`

#### Overrides

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`fromBuffer`](SoqlBooleanExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`string`): `SoqlParenExpr`

#### Parameters

##### string

`string`

#### Returns

`SoqlParenExpr`

#### Overrides

[`SoqlBooleanExpr`](SoqlBooleanExpr.md).[`fromString`](SoqlBooleanExpr.md#fromstring)
