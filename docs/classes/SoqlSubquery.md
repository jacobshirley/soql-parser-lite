[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlSubquery

# Class: SoqlSubquery

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlSubquery**(`options`): `SoqlSubquery`

#### Parameters

##### options

###### subquery

[`SoqlQuery`](SoqlQuery.md)

#### Returns

`SoqlSubquery`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### subquery

> **subquery**: [`SoqlQuery`](SoqlQuery.md)

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

> `static` **fromBuffer**(`buffer`): `SoqlSubquery`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlSubquery`

---

### fromString()

> `static` **fromString**(`string`): `SoqlSubquery`

#### Parameters

##### string

`string`

#### Returns

`SoqlSubquery`
