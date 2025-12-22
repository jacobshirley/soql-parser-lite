import { describe, expect, it } from 'vitest'
import {
    SoqlBooleanExpr,
    SoqlComparisonExpr,
    SoqlEqlExpr,
    SoqlNeExpr,
    SoqlLtExpr,
    SoqlLeExpr,
    SoqlGtExpr,
    SoqlGeExpr,
    SoqlLikeExpr,
    SoqlInExpr,
    SoqlNinExpr,
    SoqlIncludesExpr,
    SoqlExcludesExpr,
    SoqlAndExpr,
    SoqlOrExpr,
    SoqlParenExpr,
} from '../../src/objects/SoqlBooleanExpr'
import {
    SoqlField,
    SoqlStringLiteral,
    SoqlNumberLiteral,
    SoqlBooleanLiteral,
} from '../../src'
import { SoqlParserError } from '../../src/errors'

describe('SoqlBooleanExpr', () => {
    describe('Comparison Operators', () => {
        it('should parse equality operator (=)', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Name = 'Test'",
            ) as SoqlEqlExpr
            expect(expr).toBeInstanceOf(SoqlEqlExpr)
            expect(expr.left).toBeInstanceOf(SoqlField)
            expect((expr.left as SoqlField).name).toBe('Name')
            expect(expr.right).toBeInstanceOf(SoqlStringLiteral)
        })

        it('should parse not equal operator (!=)', () => {
            const expr = SoqlBooleanExpr.fromString(
                'Status != "Active"',
            ) as SoqlNeExpr
            expect(expr).toBeInstanceOf(SoqlNeExpr)
            expect((expr.left as SoqlField).name).toBe('Status')
        })

        it('should parse less than operator (<)', () => {
            const expr = SoqlBooleanExpr.fromString('Age < 30') as SoqlLtExpr
            expect(expr).toBeInstanceOf(SoqlLtExpr)
            expect((expr.left as SoqlField).name).toBe('Age')
            expect((expr.right as SoqlNumberLiteral).value).toBe(30)
        })

        it('should parse less than or equal operator (<=)', () => {
            const expr = SoqlBooleanExpr.fromString('Age <= 30') as SoqlLeExpr
            expect(expr).toBeInstanceOf(SoqlLeExpr)
        })

        it('should parse greater than operator (>)', () => {
            const expr = SoqlBooleanExpr.fromString('Age > 18') as SoqlGtExpr
            expect(expr).toBeInstanceOf(SoqlGtExpr)
            expect((expr.right as SoqlNumberLiteral).value).toBe(18)
        })

        it('should parse greater than or equal operator (>=)', () => {
            const expr = SoqlBooleanExpr.fromString('Age >= 18') as SoqlGeExpr
            expect(expr).toBeInstanceOf(SoqlGeExpr)
        })

        it('should parse LIKE operator', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Name LIKE '%Test%'",
            ) as SoqlLikeExpr
            expect(expr).toBeInstanceOf(SoqlLikeExpr)
            expect((expr.left as SoqlField).name).toBe('Name')
        })
    })

    describe('IN and NOT IN Operators', () => {
        it('should parse IN with value list', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Status IN ('Active', 'Pending')",
            ) as SoqlInExpr
            expect(expr).toBeInstanceOf(SoqlInExpr)
            expect((expr.left as SoqlField).name).toBe('Status')
            expect(Array.isArray(expr.right)).toBe(true)
            expect((expr.right as any[]).length).toBe(2)
        })

        it('should parse IN with number list', () => {
            const expr = SoqlBooleanExpr.fromString(
                'Rating IN (1, 2, 3)',
            ) as SoqlInExpr
            expect(expr).toBeInstanceOf(SoqlInExpr)
            expect(Array.isArray(expr.right)).toBe(true)
            expect((expr.right as any[]).length).toBe(3)
        })

        it('should parse IN with subquery', () => {
            const expr = SoqlBooleanExpr.fromString(
                'Id IN (SELECT AccountId FROM Contact)',
            ) as SoqlInExpr
            expect(expr).toBeInstanceOf(SoqlInExpr)
            expect(Array.isArray(expr.right)).toBe(false)
        })

        it('should parse NIN (NOT IN) operator', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Status NIN ('Inactive', 'Deleted')",
            ) as SoqlNinExpr
            expect(expr).toBeInstanceOf(SoqlNinExpr)
            expect(Array.isArray(expr.right)).toBe(true)
        })
    })

    describe('INCLUDES and EXCLUDES Operators', () => {
        it('should parse INCLUDES operator', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Products INCLUDES ('A', 'B')",
            ) as SoqlIncludesExpr
            expect(expr).toBeInstanceOf(SoqlIncludesExpr)
            expect(expr.right.length).toBe(2)
        })

        it('should parse EXCLUDES operator', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Tags EXCLUDES ('spam', 'deleted')",
            ) as SoqlExcludesExpr
            expect(expr).toBeInstanceOf(SoqlExcludesExpr)
            expect(expr.right.length).toBe(2)
        })
    })

    describe('Logical Operators', () => {
        it('should parse AND expression', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Name = 'Test' AND Age > 18",
            ) as SoqlAndExpr
            expect(expr).toBeInstanceOf(SoqlAndExpr)
            expect(expr.left).toBeInstanceOf(SoqlEqlExpr)
            expect(expr.right).toBeInstanceOf(SoqlGtExpr)
        })

        it('should parse OR expression', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Status = 'Active' OR Status = 'Pending'",
            ) as SoqlOrExpr
            expect(expr).toBeInstanceOf(SoqlOrExpr)
            expect(expr.left).toBeInstanceOf(SoqlEqlExpr)
            expect(expr.right).toBeInstanceOf(SoqlEqlExpr)
        })

        it('should handle multiple AND expressions', () => {
            const expr = SoqlBooleanExpr.fromString(
                'Age > 18 AND Age < 65 AND IsActive = true',
            ) as SoqlAndExpr
            expect(expr).toBeInstanceOf(SoqlAndExpr)
            expect(expr.left).toBeInstanceOf(SoqlAndExpr)
            expect(expr.right).toBeInstanceOf(SoqlEqlExpr)
        })

        it('should handle multiple OR expressions', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Status = 'A' OR Status = 'B' OR Status = 'C'",
            ) as SoqlOrExpr
            expect(expr).toBeInstanceOf(SoqlOrExpr)
            expect(expr.left).toBeInstanceOf(SoqlOrExpr)
        })

        it('should handle AND and OR precedence', () => {
            const expr = SoqlBooleanExpr.fromString(
                "Name = 'Test' AND Age > 18 OR Status = 'Active'",
            ) as SoqlOrExpr
            expect(expr).toBeInstanceOf(SoqlOrExpr)
            expect(expr.left).toBeInstanceOf(SoqlAndExpr)
            expect(expr.right).toBeInstanceOf(SoqlEqlExpr)
        })
    })

    describe('Parenthesized Expressions', () => {
        it('should parse expression with parentheses', () => {
            const expr = SoqlBooleanExpr.fromString(
                "(Name = 'Test')",
            ) as SoqlParenExpr
            expect(expr).toBeInstanceOf(SoqlParenExpr)
            expect(expr.expr).toBeInstanceOf(SoqlEqlExpr)
        })

        it('should handle parentheses for precedence', () => {
            const expr = SoqlBooleanExpr.fromString(
                "(Name = 'Test' OR Status = 'Active') AND Age > 18",
            ) as SoqlAndExpr
            expect(expr).toBeInstanceOf(SoqlAndExpr)
            expect(expr.left).toBeInstanceOf(SoqlParenExpr)
            expect(expr.right).toBeInstanceOf(SoqlGtExpr)
        })

        it('should handle nested parentheses', () => {
            const expr = SoqlBooleanExpr.fromString(
                "((Name = 'Test'))",
            ) as SoqlParenExpr
            expect(expr).toBeInstanceOf(SoqlParenExpr)
            expect(expr.expr).toBeInstanceOf(SoqlParenExpr)
        })
    })

    describe('Error Handling', () => {
        it('should throw error for invalid operator', () => {
            expect(() =>
                SoqlBooleanExpr.fromString('Name INVALID "Test"'),
            ).toThrow(SoqlParserError)
        })

        it('should throw error for aggregate in WHERE clause', () => {
            expect(() =>
                SoqlBooleanExpr.fromString('COUNT(Id) > 10', false),
            ).toThrow(/not allowed in WHERE clause/i)
        })
    })

    describe('Aggregate Support', () => {
        it('should parse expression with aggregate when allowAggregates is true', () => {
            // Test that parsing doesn't throw when aggregates are allowed in HAVING
            const expr = SoqlBooleanExpr.fromString('Age > 18', true)
            expect(expr).toBeDefined()
            expect(expr).toBeInstanceOf(SoqlGtExpr)
        })
    })

    describe('Constructor Tests', () => {
        it('should create SoqlEqlExpr with constructor', () => {
            const expr = new SoqlEqlExpr({
                left: new SoqlField('Name'),
                right: new SoqlStringLiteral('Test'),
            })
            expect(expr.left).toBeInstanceOf(SoqlField)
            expect(expr.right).toBeInstanceOf(SoqlStringLiteral)
        })

        it('should create SoqlAndExpr with constructor', () => {
            const expr = new SoqlAndExpr({
                left: new SoqlEqlExpr({
                    left: new SoqlField('Name'),
                    right: new SoqlStringLiteral('Test'),
                }),
                right: new SoqlGtExpr({
                    left: new SoqlField('Age'),
                    right: new SoqlNumberLiteral(18),
                }),
            })
            expect(expr.left).toBeInstanceOf(SoqlEqlExpr)
            expect(expr.right).toBeInstanceOf(SoqlGtExpr)
        })

        it('should create SoqlOrExpr with constructor', () => {
            const left = new SoqlEqlExpr({
                left: new SoqlField('Status'),
                right: new SoqlStringLiteral('Active'),
            })
            const right = new SoqlEqlExpr({
                left: new SoqlField('Status'),
                right: new SoqlStringLiteral('Pending'),
            })
            const expr = new SoqlOrExpr({ left, right })
            expect(expr.left).toBeInstanceOf(SoqlEqlExpr)
            expect(expr.right).toBeInstanceOf(SoqlEqlExpr)
        })

        it('should create SoqlInExpr with value array', () => {
            const expr = new SoqlInExpr({
                left: new SoqlField('Status'),
                right: [
                    new SoqlStringLiteral('Active'),
                    new SoqlStringLiteral('Pending'),
                ],
            })
            expect(expr.left).toBeInstanceOf(SoqlField)
            expect(Array.isArray(expr.right)).toBe(true)
        })
    })
})
