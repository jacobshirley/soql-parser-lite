[**soql-parser-lite**](../README.md)

---

[soql-parser-lite](../packages.md) / ByteStream

# Type Alias: ByteStream

> **ByteStream** = `AsyncIterable`\<[`StreamInput`](StreamInput.md)\> \| `Iterable`\<[`StreamInput`](StreamInput.md)\>

An async iterable stream of input that can be consumed incrementally.
Supports strings, numbers, arrays of numbers, or Uint8Arrays as stream items.
