[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlWhereClause

# Class: SoqlWhereClause

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlWhereClause**(`options`): `SoqlWhereClause`

#### Parameters

##### options

###### expr

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Returns

`SoqlWhereClause`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### expr

> **expr**: [`SoqlBooleanExpr`](SoqlBooleanExpr.md)

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

> `static` **fromBuffer**(`buffer`): `SoqlWhereClause`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlWhereClause`

---

### fromString()

> `static` **fromString**(`string`): `SoqlWhereClause`

#### Parameters

##### string

`string`

#### Returns

`SoqlWhereClause`
