[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlQuery

# Class: SoqlQuery

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlQuery**(`options`): `SoqlQuery`

#### Parameters

##### options

###### from

[`SoqlFromClause`](SoqlFromClause.md)

###### groupBy?

[`SoqlGroupByClause`](SoqlGroupByClause.md)

###### having?

[`SoqlHavingClause`](SoqlHavingClause.md)

###### limit?

`number`

###### offset?

`number`

###### orderBy?

[`SoqlOrderByClause`](SoqlOrderByClause.md)

###### select

[`SoqlSelectClause`](SoqlSelectClause.md)

###### where?

[`SoqlWhereClause`](SoqlWhereClause.md)

#### Returns

`SoqlQuery`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### from

> **from**: [`SoqlFromClause`](SoqlFromClause.md)

---

### groupBy?

> `optional` **groupBy**: [`SoqlGroupByClause`](SoqlGroupByClause.md)

---

### having?

> `optional` **having**: [`SoqlHavingClause`](SoqlHavingClause.md)

---

### limit?

> `optional` **limit**: `number`

---

### offset?

> `optional` **offset**: `number`

---

### orderBy?

> `optional` **orderBy**: [`SoqlOrderByClause`](SoqlOrderByClause.md)

---

### select

> **select**: [`SoqlSelectClause`](SoqlSelectClause.md)

---

### where?

> `optional` **where**: [`SoqlWhereClause`](SoqlWhereClause.md)

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

> `static` **fromBuffer**(`buffer`): `SoqlQuery`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlQuery`

---

### fromString()

> `static` **fromString**(`string`): `SoqlQuery`

#### Parameters

##### string

`string`

#### Returns

`SoqlQuery`
