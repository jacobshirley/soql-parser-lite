[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlDateLiteral

# Class: SoqlDateLiteral

## Extends

- [`SoqlValueExpr`](SoqlValueExpr.md)

## Constructors

### Constructor

> **new SoqlDateLiteral**(`value`): `SoqlDateLiteral`

#### Parameters

##### value

`string` | \{ `n`: `number`; `type`: `string`; \}

#### Returns

`SoqlDateLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`constructor`](SoqlValueExpr.md#constructor)

## Properties

### value

> **value**: `string` \| \{ `n`: `number`; `type`: `string`; \}

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

> `static` **fromBuffer**(`buffer`): `SoqlDateLiteral`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlDateLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromBuffer`](SoqlValueExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`value`): `SoqlDateLiteral`

#### Parameters

##### value

`string`

#### Returns

`SoqlDateLiteral`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromString`](SoqlValueExpr.md#fromstring)
