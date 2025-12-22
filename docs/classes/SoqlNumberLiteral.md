[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlNumberLiteral

# Class: SoqlNumberLiteral

## Extends

- [`SoqlValueExpr`](SoqlValueExpr.md)

## Constructors

### Constructor

> **new SoqlNumberLiteral**(`value`): `SoqlNumberLiteral`

#### Parameters

##### value

`number`

#### Returns

`SoqlNumberLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`constructor`](SoqlValueExpr.md#constructor)

## Properties

### value

> **value**: `number`

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

> `static` **fromBuffer**(`buffer`): `SoqlNumberLiteral`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlNumberLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromBuffer`](SoqlValueExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`value`): `SoqlNumberLiteral`

#### Parameters

##### value

`string`

#### Returns

`SoqlNumberLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromString`](SoqlValueExpr.md#fromstring)
