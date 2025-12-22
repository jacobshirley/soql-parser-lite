[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlValueExpr

# Abstract Class: SoqlValueExpr

## Extends

- [`SoqlBase`](SoqlBase.md)

## Extended by

- [`SoqlStringLiteral`](SoqlStringLiteral.md)
- [`SoqlNumberLiteral`](SoqlNumberLiteral.md)
- [`SoqlBooleanLiteral`](SoqlBooleanLiteral.md)
- [`SoqlDateValueLiteral`](SoqlDateValueLiteral.md)
- [`SoqlDateLiteral`](SoqlDateLiteral.md)
- [`SoqlDateTimeLiteral`](SoqlDateTimeLiteral.md)
- [`SoqlBindVariable`](SoqlBindVariable.md)
- [`SoqlNullLiteral`](SoqlNullLiteral.md)

## Constructors

### Constructor

> **new SoqlValueExpr**(): `SoqlValueExpr`

#### Returns

`SoqlValueExpr`

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

> `static` **fromBuffer**(`buffer`): `SoqlValueExpr`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlValueExpr`

---

### fromString()

> `static` **fromString**(`string`): `SoqlValueExpr`

#### Parameters

##### string

`string`

#### Returns

`SoqlValueExpr`
