/**
 * Union type representing valid stream input formats.
 */
export type StreamInput = string | number | number[] | Uint8Array

/**
 * An async iterable stream of input that can be consumed incrementally.
 * Supports strings, numbers, arrays of numbers, or Uint8Arrays as stream items.
 */
export type ByteStream = AsyncIterable<StreamInput> | Iterable<StreamInput>

/**
 * Represents the SELECT clause of a SOQL query.
 */
export interface SelectClause {
    /** Whether DISTINCT is specified to eliminate duplicate rows */
    distinct?: boolean
    /** The list of items being selected (fields, aggregates, or subqueries) */
    items: SelectItem[]
}

/**
 * Represents a field path that may traverse relationships.
 * For example, "Account.Owner.Name" would have parts ["Account", "Owner", "Name"].
 */
export interface FieldPath {
    /** The parts of the field path separated by dots */
    parts: string[] // ["Account", "Owner", "Name"]
}

/**
 * Represents a simple field selection in the SELECT clause.
 */
export interface FieldSelect {
    type: 'field'
    /** The field path being selected */
    fieldName: FieldPath
    /** Optional alias for the field */
    alias?: string
}

/**
 * Represents an aggregate function call in the SELECT clause.
 * Examples: COUNT(Id), MAX(Amount), AVG(Revenue)
 */
export interface AggregateSelect {
    type: 'aggregate'
    /** The name of the aggregate function (COUNT, MAX, MIN, SUM, AVG) */
    functionName: string
    /** The field being aggregated */
    fieldName: FieldPath
    /** Optional alias for the result */
    alias?: string
}

/**
 * Represents a subquery in the SELECT clause.
 */
export interface SubquerySelect {
    type: 'subquery'
    /** The nested SOQL query */
    subquery: SoqlQuery
}

/**
 * Union type representing any valid SELECT clause item.
 */
export type SelectItem = FieldSelect | AggregateSelect | SubquerySelect

/**
 * Represents a Salesforce object name.
 * TODO: Support more complex object names with namespaces
 */
export type ObjectName = string //TODO: more complex object names with namespaces?

/**
 * Represents an object (table) reference in the FROM clause.
 */
export interface FromObject {
    /** The name of the object (e.g., "Account", "Contact") */
    name: ObjectName
    /** Optional alias for the object */
    alias?: string
}

/**
 * Represents the FROM clause of a SOQL query.
 */
export interface FromClause {
    /** The list of objects being queried */
    objects: FromObject[]
}

/**
 * Represents a logical expression (AND/OR) combining two boolean expressions.
 */
export interface LogicalExpr {
    type: 'logical'
    /** The logical operator (AND or OR) */
    operator: 'AND' | 'OR'
    /** The left-hand side expression */
    left: BooleanExpr
    /** The right-hand side expression */
    right: BooleanExpr
}

/**
 * Valid comparison operators in SOQL.
 */
export const OPERATORS = [
    '=',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'in',
    'like',
] as const

/**
 * Represents a comparison expression (field operator value).
 */
export interface ComparisonExpr {
    type: 'comparison'
    /** The comparison operator */
    operator: '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like'
    /** The field being compared */
    left: FieldPath
    /** The value to compare against */
    right: ValueExpr
}

/**
 * Represents an IN expression checking if a field's value is in a set.
 */
export interface InExpr {
    type: 'in'
    /** The field being checked */
    left: FieldPath
    /** Array of values or a subquery */
    right: ValueExpr[] | SoqlQuery // array of literals
}

/**
 * Represents a boolean expression wrapped in parentheses for grouping.
 */
export interface ParenExpr {
    type: 'paren'
    /** The expression inside the parentheses */
    expr: BooleanExpr
}

/**
 * Union type representing any valid boolean expression in a WHERE or HAVING clause.
 */
export type BooleanExpr = LogicalExpr | ComparisonExpr | InExpr | ParenExpr

/**
 * Represents the WHERE clause of a SOQL query.
 */
export interface WhereClause {
    /** The boolean expression that filters the results */
    expr: BooleanExpr
}

/**
 * Represents the GROUP BY clause of a SOQL query.
 */
export interface GroupByClause {
    /** The fields to group by */
    fields: FieldPath[]
    /** Whether ROLLUP is specified for subtotals */
    rollup?: boolean
}

/**
 * Represents the HAVING clause of a SOQL query (filters aggregated results).
 */
export interface HavingClause {
    /** The boolean expression that filters aggregated results */
    expr: BooleanExpr
}

/**
 * Represents a string literal value.
 */
export interface StringLiteral {
    type: 'string'
    /** The string value */
    value: string
}

/**
 * Represents a numeric literal value.
 */
export interface NumberLiteral {
    type: 'number'
    /** The numeric value */
    value: number
}

/**
 * Represents a boolean literal value (true or false).
 */
export interface BooleanLiteral {
    type: 'boolean'
    /** The boolean value */
    value: boolean
}

/**
 * Represents a date literal in ISO 8601 format (YYYY-MM-DD).
 */
export interface DateValueLiteral {
    type: 'date'
    /** ISO 8601 date string (YYYY-MM-DD) */
    value: string // ISO 8601 date string (YYYY-MM-DD)
}

/**
 * Static date literals supported by SOQL (e.g., TODAY, YESTERDAY, THIS_MONTH).
 */
export const DATE_LITERALS = [
    'TODAY',
    'YESTERDAY',
    'TOMORROW',
    'THIS_WEEK',
    'LAST_WEEK',
    'NEXT_WEEK',
    'THIS_MONTH',
    'LAST_MONTH',
    'NEXT_MONTH',
    'LAST_90_DAYS',
    'NEXT_90_DAYS',
    'THIS_QUARTER',
    'LAST_QUARTER',
    'NEXT_QUARTER',
    'THIS_YEAR',
    'LAST_YEAR',
    'NEXT_YEAR',
    'THIS_FISCAL_QUARTER',
    'LAST_FISCAL_QUARTER',
    'NEXT_FISCAL_QUARTER',
    'THIS_FISCAL_YEAR',
    'LAST_FISCAL_YEAR',
    'NEXT_FISCAL_YEAR',
] as const

/**
 * Dynamic date literals that take a numeric parameter (e.g., LAST_N_DAYS:7).
 */
export const DATE_LITERALS_DYNAMIC = [
    'LAST_N_DAYS',
    'NEXT_N_DAYS',
    'N_DAYS_AGO',
    'NEXT_N_WEEKS',
    'LAST_N_WEEKS',
    'N_WEEKS_AGO',
    'NEXT_N_MONTHS',
    'LAST_N_MONTHS',
    'N_MONTHS_AGO',
    'NEXT_N_QUARTERS',
    'LAST_N_QUARTERS',
    'N_QUARTERS_AGO',
    'NEXT_N_YEARS',
    'LAST_N_YEARS',
    'N_YEARS_AGO',
    'NEXT_N_FISCAL_YEARS',
    'LAST_N_FISCAL_YEARS',
    'N_FISCAL_YEARS_AGO',
    'NEXT_N_FISCAL_QUARTERS',
    'LAST_N_FISCAL_QUARTERS',
] as const

/**
 * Represents a SOQL date literal (static like TODAY or dynamic like LAST_N_DAYS:7).
 */
export interface DateLiteral {
    type: 'dateLiteral'
    /** Either a static date literal or a dynamic one with a numeric parameter */
    value:
        | (typeof DATE_LITERALS)[number]
        | {
              type: (typeof DATE_LITERALS_DYNAMIC)[number]
              n: number
          }
}

/**
 * Represents a datetime literal in ISO 8601 format.
 */
export interface DateTimeLiteral {
    type: 'datetime'
    /** ISO 8601 datetime string */
    value: string // ISO 8601 datetime string
}

/**
 * Represents a bind variable that will be substituted at runtime (e.g., :variableName).
 */
export interface BindVariable {
    type: 'bindVariable'
    /** The name of the bind variable */
    name: string
}

/**
 * Represents a null literal value.
 */
export interface NullLiteral {
    type: 'null'
    /** Always null */
    value: null
}

/**
 * Union type representing any valid value expression in SOQL.
 */
export type ValueExpr =
    | StringLiteral
    | NumberLiteral
    | BooleanLiteral
    | DateLiteral
    | DateValueLiteral
    | DateTimeLiteral
    | BindVariable
    | NullLiteral

/**
 * Represents a field in an ORDER BY clause with its sort direction.
 */
export type OrderByField = {
    /** The field to sort by */
    field: FieldPath
    /** Sort direction (ascending or descending) */
    direction: 'ASC' | 'DESC'
}

/**
 * Represents the ORDER BY clause of a SOQL query.
 */
export interface OrderByClause {
    /** The fields to sort by with their directions */
    fields: OrderByField[]
}

/**
 * Represents a complete SOQL query with all its clauses.
 */
export interface SoqlQuery {
    type: 'soqlQuery'
    /** The SELECT clause (required) */
    select: SelectClause
    /** The FROM clause (required) */
    from: FromClause
    /** The WHERE clause (optional) */
    where?: WhereClause
    /** The GROUP BY clause (optional) */
    groupBy?: GroupByClause
    /** The HAVING clause (optional) */
    having?: HavingClause
    /** The ORDER BY clause (optional) */
    orderBy?: OrderByClause
    /** The LIMIT value (optional) */
    limit?: number
    /** The OFFSET value (optional) */
    offset?: number
}
