[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlDateValueLiteral

# Class: SoqlDateValueLiteral

## Extends

- [`SoqlValueExpr`](SoqlValueExpr.md)

## Constructors

### Constructor

> **new SoqlDateValueLiteral**(`value`): `SoqlDateValueLiteral`

#### Parameters

##### value

`string`

#### Returns

`SoqlDateValueLiteral`

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

> `static` **fromBuffer**(`buffer`): `SoqlDateValueLiteral`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlDateValueLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromBuffer`](SoqlValueExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`value`): `SoqlDateValueLiteral`

#### Parameters

##### value

`string`

#### Returns

`SoqlDateValueLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromString`](SoqlValueExpr.md#fromstring)
