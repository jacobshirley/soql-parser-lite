[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlGroupByClause

# Class: SoqlGroupByClause

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlGroupByClause**(`options`): `SoqlGroupByClause`

#### Parameters

##### options

###### fields

[`SoqlGroupByField`](SoqlGroupByField.md)[]

###### groupingFunction?

`"ROLLUP"` \| `"CUBE"`

#### Returns

`SoqlGroupByClause`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### fields

> **fields**: [`SoqlGroupByField`](SoqlGroupByField.md)[]

---

### groupingFunction?

> `optional` **groupingFunction**: `"ROLLUP"` \| `"CUBE"`

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

> `static` **fromBuffer**(`buffer`): `SoqlGroupByClause`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlGroupByClause`

---

### fromString()

> `static` **fromString**(`string`): `SoqlGroupByClause`

#### Parameters

##### string

`string`

#### Returns

`SoqlGroupByClause`
