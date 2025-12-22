[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlDateTimeLiteral

# Class: SoqlDateTimeLiteral

## Extends

- [`SoqlValueExpr`](SoqlValueExpr.md)

## Constructors

### Constructor

> **new SoqlDateTimeLiteral**(`value`): `SoqlDateTimeLiteral`

#### Parameters

##### value

`string`

#### Returns

`SoqlDateTimeLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`constructor`](SoqlValueExpr.md#constructor)

## Properties

### value

> **value**: `string`

## Accessors

### type

#### Get Signature

> **get** **type**(): `string`

##### Returns

`string`

#### Inherited from

[`SoqlValueExpr`](SoqlValueExpr.md).[`type`](SoqlValueExpr.md#type)

## Methods

### fromBuffer()

> `static` **fromBuffer**(`buffer`): `SoqlDateTimeLiteral`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlDateTimeLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromBuffer`](SoqlValueExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`value`): `SoqlDateTimeLiteral`

#### Parameters

##### value

`string`

#### Returns

`SoqlDateTimeLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromString`](SoqlValueExpr.md#fromstring)
