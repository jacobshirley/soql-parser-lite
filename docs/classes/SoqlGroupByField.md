[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlGroupByField

# Class: SoqlGroupByField

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlGroupByField**(`options`): `SoqlGroupByField`

#### Parameters

##### options

###### field

[`SoqlField`](SoqlField.md) \| [`SoqlAggregateField`](SoqlAggregateField.md)

#### Returns

`SoqlGroupByField`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### field

> **field**: [`SoqlField`](SoqlField.md) \| [`SoqlAggregateField`](SoqlAggregateField.md)

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

> `static` **fromBuffer**(`buffer`): `SoqlGroupByField`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlGroupByField`

---

### fromString()

> `static` **fromString**(`string`): `SoqlGroupByField`

#### Parameters

##### string

`string`

#### Returns

`SoqlGroupByField`
