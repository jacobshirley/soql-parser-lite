[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlHavingClause

# Class: SoqlHavingClause

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlHavingClause**(`expr`): `SoqlHavingClause`

#### Parameters

##### expr

[`SoqlBooleanExpr`](SoqlBooleanExpr.md)

#### Returns

`SoqlHavingClause`

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

> `static` **fromBuffer**(`buffer`): `SoqlHavingClause`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlHavingClause`

---

### fromString()

> `static` **fromString**(`string`): `SoqlHavingClause`

#### Parameters

##### string

`string`

#### Returns

`SoqlHavingClause`
