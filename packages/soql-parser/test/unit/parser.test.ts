import { describe, it, expect } from 'vitest'
import {
    SoqlSelectParser
} from '../../src/index.js'

describe('SOQL Parsing', () => {
    it('should parse a select clause', () => {
        const soql = '  SELECT Name, Age, IsActive, Sub.Field, Sub.Field2  FROM User'
        const object = new SoqlSelectParser()

        object.feed(soql)

        const fields = object.read()
        expect(fields.map(x => x.fieldName.parts.join('.'))).toEqual(['Name', 'Age', 'IsActive', 'Sub.Field', 'Sub.Field2'])
    })
})