[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / SoqlStringBuffer

# Class: SoqlStringBuffer

## Constructors

### Constructor

> **new SoqlStringBuffer**(`value`): `SoqlStringBuffer`

#### Parameters

##### value

`string`

#### Returns

`SoqlStringBuffer`

## Properties

### buffer

> **buffer**: `ByteBuffer`

## Methods

### expect()

> **expect**(...`expectedByte`): `void`

#### Parameters

##### expectedByte

...`number`[]

#### Returns

`void`

---

### peek()

> **peek**(`ahead`): `number` \| `null`

#### Parameters

##### ahead

`number` = `0`

#### Returns

`number` \| `null`

---

### peekKeyword()

> **peekKeyword**(): `"="` \| `"!="` \| `"<"` \| `"<="` \| `">"` \| `">="` \| `"LIKE"` \| `"NLIKE"` \| `"IN"` \| `"NIN"` \| `"INCLUDES"` \| `"EXCLUDES"` \| `"SELECT"` \| `"FROM"` \| `"WHERE"` \| `"AND"` \| `"OR"` \| `"COUNT"` \| `"MAX"` \| `"MIN"` \| `"SUM"` \| `"AVG"` \| `"ASC"` \| `"DESC"` \| `"FIRST"` \| `"GROUP"` \| `"HAVING"` \| `"LAST"` \| `"LIMIT"` \| `"NOT"` \| `"NULL"` \| `"NULLS"` \| `"USING"` \| `"WITH"` \| `"ORDER"` \| `"BY"` \| `"OFFSET"` \| `"ROLLUP"` \| `"CUBE"` \| `"DISTINCT"` \| `null`

Peeks ahead at the next SOQL keyword without consuming it.

#### Returns

`"="` \| `"!="` \| `"<"` \| `"<="` \| `">"` \| `">="` \| `"LIKE"` \| `"NLIKE"` \| `"IN"` \| `"NIN"` \| `"INCLUDES"` \| `"EXCLUDES"` \| `"SELECT"` \| `"FROM"` \| `"WHERE"` \| `"AND"` \| `"OR"` \| `"COUNT"` \| `"MAX"` \| `"MIN"` \| `"SUM"` \| `"AVG"` \| `"ASC"` \| `"DESC"` \| `"FIRST"` \| `"GROUP"` \| `"HAVING"` \| `"LAST"` \| `"LIMIT"` \| `"NOT"` \| `"NULL"` \| `"NULLS"` \| `"USING"` \| `"WITH"` \| `"ORDER"` \| `"BY"` \| `"OFFSET"` \| `"ROLLUP"` \| `"CUBE"` \| `"DISTINCT"` \| `null`

The next keyword if valid, null otherwise

---

### peekString()

> **peekString**(): `string`

Peeks ahead at the next string token without consuming it.

#### Returns

`string`

The next string token in the buffer

---

### readKeyword()

> **readKeyword**(): `"="` \| `"!="` \| `"<"` \| `"<="` \| `">"` \| `">="` \| `"LIKE"` \| `"NLIKE"` \| `"IN"` \| `"NIN"` \| `"INCLUDES"` \| `"EXCLUDES"` \| `"SELECT"` \| `"FROM"` \| `"WHERE"` \| `"AND"` \| `"OR"` \| `"COUNT"` \| `"MAX"` \| `"MIN"` \| `"SUM"` \| `"AVG"` \| `"ASC"` \| `"DESC"` \| `"FIRST"` \| `"GROUP"` \| `"HAVING"` \| `"LAST"` \| `"LIMIT"` \| `"NOT"` \| `"NULL"` \| `"NULLS"` \| `"USING"` \| `"WITH"` \| `"ORDER"` \| `"BY"` \| `"OFFSET"` \| `"ROLLUP"` \| `"CUBE"` \| `"DISTINCT"`

Reads and consumes the next SOQL keyword from the buffer.

#### Returns

`"="` \| `"!="` \| `"<"` \| `"<="` \| `">"` \| `">="` \| `"LIKE"` \| `"NLIKE"` \| `"IN"` \| `"NIN"` \| `"INCLUDES"` \| `"EXCLUDES"` \| `"SELECT"` \| `"FROM"` \| `"WHERE"` \| `"AND"` \| `"OR"` \| `"COUNT"` \| `"MAX"` \| `"MIN"` \| `"SUM"` \| `"AVG"` \| `"ASC"` \| `"DESC"` \| `"FIRST"` \| `"GROUP"` \| `"HAVING"` \| `"LAST"` \| `"LIMIT"` \| `"NOT"` \| `"NULL"` \| `"NULLS"` \| `"USING"` \| `"WITH"` \| `"ORDER"` \| `"BY"` \| `"OFFSET"` \| `"ROLLUP"` \| `"CUBE"` \| `"DISTINCT"`

The consumed keyword

#### Throws

SoqlParserError if the next token is not a valid keyword

---

### readString()

> **readString**(): `string`

Reads and consumes the next string token from the buffer.

#### Returns

`string`

The consumed string token

---

### skipWhitespace()

> **skipWhitespace**(): `void`

Skips whitespace characters in the buffer.

#### Returns

`void`

---

### tryParse()

> **tryParse**\<`T`\>(`parser`): `T` \| `undefined`

#### Type Parameters

##### T

`T`

#### Parameters

##### parser

() => `T`

#### Returns

`T` \| `undefined`
