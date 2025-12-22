[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlBooleanLiteral

# Class: SoqlBooleanLiteral

## Extends

- [`SoqlValueExpr`](SoqlValueExpr.md)

## Constructors

### Constructor

> **new SoqlBooleanLiteral**(`value`): `SoqlBooleanLiteral`

#### Parameters

##### value

`boolean`

#### Returns

`SoqlBooleanLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`constructor`](SoqlValueExpr.md#constructor)

## Properties

### value

> **value**: `boolean`

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

> `static` **fromBuffer**(`buffer`): `SoqlBooleanLiteral`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlBooleanLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromBuffer`](SoqlValueExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`value`): `SoqlBooleanLiteral`

#### Parameters

##### value

`string`

#### Returns

`SoqlBooleanLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromString`](SoqlValueExpr.md#fromstring)
