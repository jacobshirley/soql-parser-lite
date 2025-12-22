[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlOrderByField

# Class: SoqlOrderByField

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlOrderByField**(`options`): `SoqlOrderByField`

#### Parameters

##### options

###### direction

`"ASC"` \| `"DESC"` \| `null`

###### field

[`SoqlField`](SoqlField.md) \| [`SoqlAggregateField`](SoqlAggregateField.md)

#### Returns

`SoqlOrderByField`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### direction

> **direction**: `"ASC"` \| `"DESC"` \| `null`

---

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

> `static` **fromBuffer**(`buffer`): `SoqlOrderByField`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlOrderByField`

---

### fromString()

> `static` **fromString**(`string`): `SoqlOrderByField`

#### Parameters

##### string

`string`

#### Returns

`SoqlOrderByField`
