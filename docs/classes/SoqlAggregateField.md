[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlAggregateField

# Class: SoqlAggregateField

## Extends

- [`SoqlBase`](SoqlBase.md)

## Constructors

### Constructor

> **new SoqlAggregateField**(`options`): `SoqlAggregateField`

#### Parameters

##### options

###### field

[`SoqlField`](SoqlField.md)

###### functionName

`string`

#### Returns

`SoqlAggregateField`

#### Overrides

[`SoqlBase`](SoqlBase.md).[`constructor`](SoqlBase.md#constructor)

## Properties

### field

> **field**: [`SoqlField`](SoqlField.md)

---

### functionName

> **functionName**: `string`

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

> `static` **fromBuffer**(`buffer`): `SoqlAggregateField`

#### Parameters

##### buffer

[`SoqlStringBuffer`](SoqlStringBuffer.md)

#### Returns

`SoqlAggregateField`

---

### fromString()

> `static` **fromString**(`string`): `SoqlAggregateField`

#### Parameters

##### string

`string`

#### Returns

`SoqlAggregateField`
