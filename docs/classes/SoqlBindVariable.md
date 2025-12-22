[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlBindVariable

# Class: SoqlBindVariable

## Extends

- [`SoqlValueExpr`](SoqlValueExpr.md)

## Constructors

### Constructor

> **new SoqlBindVariable**(`name`): `SoqlBindVariable`

#### Parameters

##### name

`string`

#### Returns

`SoqlBindVariable`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`constructor`](SoqlValueExpr.md#constructor)

## Properties

### name

> **name**: `string`

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

> `static` **fromBuffer**(`buffer`): `SoqlBindVariable`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlBindVariable`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromBuffer`](SoqlValueExpr.md#frombuffer)

---

### fromString()

> `static` **fromString**(`value`): `SoqlBindVariable`

#### Parameters

##### value

`string`

#### Returns

`SoqlBindVariable`

#### Overrides

[`SoqlValueExpr`](SoqlValueExpr.md).[`fromString`](SoqlValueExpr.md#fromstring)
