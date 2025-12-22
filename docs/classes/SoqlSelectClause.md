[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlSelectClause

# Class: SoqlSelectClause

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlSelectClause**(`options`): `SoqlSelectClause`

#### Parameters

##### options

###### items

[`SoqlSelectItem`](SoqlSelectItem.md)[]

#### Returns

`SoqlSelectClause`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### items

> **items**: [`SoqlSelectItem`](SoqlSelectItem.md)[]

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

> `static` **fromBuffer**(`buffer`): `SoqlSelectClause`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlSelectClause`

---

### fromString()

> `static` **fromString**(`string`): `SoqlSelectClause`

#### Parameters

##### string

`string`

#### Returns

`SoqlSelectClause`
