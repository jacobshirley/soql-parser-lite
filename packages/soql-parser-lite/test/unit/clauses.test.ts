import { assert, describe, expect, it } from 'vitest'
import {
    SoqlLimitClause,
    SoqlOffsetClause,
    SoqlOrderByClause,
    SoqlOrderByField,
    SoqlGroupByClause,
    SoqlGroupByField,
    SoqlHavingClause,
    SoqlFromObject,
    SoqlField,
    SoqlEqlExpr,
    SoqlStringLiteral,
} from '../../src'
import { SoqlParserError } from '../../src/errors'

describe('SOQL Clauses Error Handling', () => {
    describe('SoqlLimitClause', () => {
        it('should parse valid LIMIT clause', () => {
            const limit = SoqlLimitClause.fromString('LIMIT 10')
            expect(limit).toBe(10)
        })

        it('should throw error for invalid LIMIT', () => {
            expect(() => SoqlLimitClause.fromString('LIMIT abc')).toThrow(
                SoqlParserError,
            )
        })

        it('should throw error for wrong keyword', () => {
            expect(() => SoqlLimitClause.fromString('OFFSET 10')).toThrow(
                /Expected LIMIT keyword/,
            )
        })

        it('should create with constructor', () => {
            const clause = new SoqlLimitClause(100)
            expect(clause.value).toBe(100)
        })
    })

    describe('SoqlOffsetClause', () => {
        it('should parse valid OFFSET clause', () => {
            const offset = SoqlOffsetClause.fromString('OFFSET 5')
            expect(offset).toBe(5)
        })

        it('should throw error for invalid OFFSET', () => {
            expect(() => SoqlOffsetClause.fromString('OFFSET xyz')).toThrow(
                SoqlParserError,
            )
        })

        it('should throw error for wrong keyword', () => {
            expect(() => SoqlOffsetClause.fromString('LIMIT 5')).toThrow(
                /Expected OFFSET keyword/,
            )
        })

        it('should create with constructor', () => {
            const clause = new SoqlOffsetClause(50)
            expect(clause.value).toBe(50)
        })
    })

    describe('SoqlOrderByClause', () => {
        it('should parse ORDER BY with ASC', () => {
            const clause = SoqlOrderByClause.fromString('ORDER BY Name ASC')
            expect(clause.fields).toHaveLength(1)
            expect(clause.fields[0].field).toEqual({ name: 'Name' })
            expect(clause.fields[0].direction).toBe('ASC')
        })

        it('should parse ORDER BY with DESC', () => {
            const clause = SoqlOrderByClause.fromString('ORDER BY Name DESC')
            expect(clause.fields).toHaveLength(1)
            expect(clause.fields[0].direction).toBe('DESC')
        })

        it('should parse multiple fields', () => {
            const clause = SoqlOrderByClause.fromString(
                'ORDER BY Name ASC, CreatedDate DESC',
            )
            expect(clause.fields).toHaveLength(2)
        })
    })

    describe('SoqlOrderByField', () => {
        it('should create with field name only', () => {
            const field = new SoqlOrderByField({
                field: new SoqlField('Name'),
                direction: null,
            })
            expect(field.field).toEqual({ name: 'Name' })
            expect(field.direction).toBeNull()
        })

        it('should create with direction', () => {
            const field = new SoqlOrderByField({
                field: new SoqlField('CreatedDate'),
                direction: 'DESC',
            })
            expect(field.direction).toBe('DESC')
        })
    })

    describe('SoqlGroupByClause', () => {
        it('should parse multiple fields GROUP BY', () => {
            const clause = SoqlGroupByClause.fromString(
                'GROUP BY Industry, Rating',
            )
            expect(clause.fields).toHaveLength(2)
        })

        it('should throw error for wrong first keyword', () => {
            expect(() =>
                SoqlGroupByClause.fromString('ORDER BY Industry'),
            ).toThrow(/Expected GROUP keyword/)
        })

        it('should throw error for missing BY keyword', () => {
            expect(() =>
                SoqlGroupByClause.fromString('GROUP WITH Industry'),
            ).toThrow(/Expected BY keyword/)
        })

        it('should parse GROUP BY with ROLLUP', () => {
            const clause = SoqlGroupByClause.fromString(
                'GROUP BY ROLLUP(Industry)',
            )
            expect(clause.groupingFunction).toBe('ROLLUP')
            expect(clause.fields).toHaveLength(1)
        })

        it('should parse GROUP BY with CUBE', () => {
            const clause = SoqlGroupByClause.fromString(
                'GROUP BY CUBE(Industry)',
            )
            expect(clause.groupingFunction).toBe('CUBE')
            expect(clause.fields).toHaveLength(1)
        })

        it('should parse GROUP BY ROLLUP with multiple fields', () => {
            const clause = SoqlGroupByClause.fromString(
                'GROUP BY ROLLUP(Industry, Rating)',
            )
            expect(clause.groupingFunction).toBe('ROLLUP')
            expect(clause.fields).toHaveLength(2)
        })
    })

    describe('SoqlGroupByField', () => {
        it('should create with field name', () => {
            const field = SoqlGroupByField.fromString('Industry')
            expect(field.field).toEqual(new SoqlField('Industry'))
        })

        it('should create with constructor', () => {
            const field = new SoqlGroupByField({
                field: new SoqlField('Rating'),
            })
            assert(field.field instanceof SoqlField)
            expect(field.field.name).toBe('Rating')
        })
    })

    describe('SoqlHavingClause', () => {
        it('should parse HAVING clause', () => {
            const clause = SoqlHavingClause.fromString("HAVING Name = 'Test'")
            expect(clause.expr).toBeInstanceOf(SoqlEqlExpr)
        })

        it('should throw error for wrong keyword', () => {
            expect(() =>
                SoqlHavingClause.fromString("WHERE Name = 'Test'"),
            ).toThrow(/Expected HAVING keyword/)
        })

        it('should create with constructor', () => {
            const expr = new SoqlEqlExpr({
                left: new SoqlField('Name'),
                right: new SoqlStringLiteral('Test'),
            })
            const clause = new SoqlHavingClause(expr)
            expect(clause.expr).toBe(expr)
        })
    })

    describe('SoqlFromObject', () => {
        it('should parse object name only', () => {
            const obj = SoqlFromObject.fromString('Account')
            expect(obj.name).toBe('Account')
            expect(obj.alias).toBeUndefined()
        })

        it('should parse object with alias', () => {
            const obj = SoqlFromObject.fromString('Account a')
            expect(obj.name).toBe('Account')
            expect(obj.alias).toBe('a')
        })

        it('should create with constructor', () => {
            const obj = new SoqlFromObject({ name: 'Contact', alias: 'c' })
            expect(obj.name).toBe('Contact')
            expect(obj.alias).toBe('c')
        })
    })
})
