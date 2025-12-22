[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlOrderByClause

# Class: SoqlOrderByClause

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlOrderByClause**(`fields`): `SoqlOrderByClause`

#### Parameters

##### fields

[`SoqlOrderByField`](SoqlOrderByField.md)[]

#### Returns

`SoqlOrderByClause`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### fields

> **fields**: [`SoqlOrderByField`](SoqlOrderByField.md)[]

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

> `static` **fromBuffer**(`buffer`): `SoqlOrderByClause`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlOrderByClause`

---

### fromString()

> `static` **fromString**(`string`): `SoqlOrderByClause`

#### Parameters

##### string

`string`

#### Returns

`SoqlOrderByClause`
