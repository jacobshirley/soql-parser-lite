[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlField

# Class: SoqlField

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlField**(`name`): `SoqlField`

#### Parameters

##### name

`string`

#### Returns

`SoqlField`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

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

[`SoqlBase`](SoqlBase.md).[`type`](SoqlBase.md#type)

## Methods

### fromBuffer()

> `static` **fromBuffer**(`buffer`): `SoqlField`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlField`

---

### fromString()

> `static` **fromString**(`name`): `SoqlField`

#### Parameters

##### name

`string`

#### Returns

`SoqlField`
