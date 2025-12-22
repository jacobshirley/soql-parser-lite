[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlSelectItem

# Class: SoqlSelectItem

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlSelectItem**(`options`): `SoqlSelectItem`

#### Parameters

##### options

###### alias?

`string`

###### item

[`SoqlField`](SoqlField.md) \| [`SoqlAggregateField`](SoqlAggregateField.md) \| [`SoqlSubquery`](SoqlSubquery.md)

#### Returns

`SoqlSelectItem`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### alias?

> `optional` **alias**: `string`

---

### item

> **item**: [`SoqlField`](SoqlField.md) \| [`SoqlAggregateField`](SoqlAggregateField.md) \| [`SoqlSubquery`](SoqlSubquery.md)

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

> `static` **fromBuffer**(`buffer`): `SoqlSelectItem`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlSelectItem`

---

### fromString()

> `static` **fromString**(`string`): `SoqlSelectItem`

#### Parameters

##### string

`string`

#### Returns

`SoqlSelectItem`
