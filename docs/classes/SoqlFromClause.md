[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlFromClause

# Class: SoqlFromClause

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlFromClause**(`options`): `SoqlFromClause`

#### Parameters

##### options

###### objects

[`SoqlFromObject`](SoqlFromObject.md)[]

#### Returns

`SoqlFromClause`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### objects

> **objects**: [`SoqlFromObject`](SoqlFromObject.md)[]

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

> `static` **fromBuffer**(`buffer`): `SoqlFromClause`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlFromClause`

---

### fromString()

> `static` **fromString**(`string`): `SoqlFromClause`

#### Parameters

##### string

`string`

#### Returns

`SoqlFromClause`
