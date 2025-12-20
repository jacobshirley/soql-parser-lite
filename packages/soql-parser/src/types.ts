/**
 * Union type representing valid JSON stream input formats.
 */
export type StreamInput = string | number | number[] | Uint8Array

/**
 * An async iterable stream of JSON input that can be consumed incrementally.
 * Supports strings, numbers, arrays of numbers, or Uint8Arrays as stream items.
 */
export type ByteStream = AsyncIterable<StreamInput> | Iterable<StreamInput>

export interface SelectClause {
    distinct?: boolean
    items: SelectItem[]
}

export interface FieldPath {
    parts: string[] // ["Account", "Owner", "Name"]
}

export interface FieldSelect {
    type: 'field'
    fieldName: FieldPath
    alias?: string
}

export interface AggregateSelect {
    type: 'aggregate'
    functionName: string
    fieldName: FieldPath
    alias?: string
}

export interface SubquerySelect {
    type: 'subquery'
    subquery: SoqlQuery
}

export type SelectItem = FieldSelect | AggregateSelect | SubquerySelect

export type ObjectName = string //TODO: more complex object names with namespaces?

export interface FromObject {
    name: ObjectName
    alias?: string
}

export interface FromClause {
    objects: FromObject[]
}

export interface LogicalExpr {
    type: 'logical'
    operator: 'AND' | 'OR'
    left: BooleanExpr
    right: BooleanExpr
}

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

export interface ComparisonExpr {
    type: 'comparison'
    operator: '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like'
    left: FieldPath
    right: ValueExpr
}

export interface InExpr {
    type: 'in'
    left: FieldPath
    right: ValueExpr[] | SoqlQuery // array of literals
}

export interface ParenExpr {
    type: 'paren'
    expr: BooleanExpr
}

export type BooleanExpr = LogicalExpr | ComparisonExpr | InExpr | ParenExpr

export interface WhereClause {
    expr: BooleanExpr
}

export interface GroupByClause {
    fields: FieldPath[]
    rollup?: boolean
}

export interface StringLiteral {
    type: 'string'
    value: string
}

export interface NumberLiteral {
    type: 'number'
    value: number
}

export interface BooleanLiteral {
    type: 'boolean'
    value: boolean
}

export interface DateValueLiteral {
    type: 'date'
    value: string // ISO 8601 date string (YYYY-MM-DD)
}

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

export interface DateLiteral {
    type: 'dateLiteral'
    value:
        | (typeof DATE_LITERALS)[number]
        | {
              type: (typeof DATE_LITERALS_DYNAMIC)[number]
              n: number
          }
}

export interface DateTimeLiteral {
    type: 'datetime'
    value: string // ISO 8601 datetime string
}

export interface BindVariable {
    type: 'bindVariable'
    name: string
}

export interface NullLiteral {
    type: 'null'
    value: null
}

export type ValueExpr =
    | StringLiteral
    | NumberLiteral
    | BooleanLiteral
    | DateLiteral
    | DateValueLiteral
    | DateTimeLiteral
    | BindVariable
    | NullLiteral

export type OrderByField = {
    field: FieldPath
    direction: 'ASC' | 'DESC'
}

export interface OrderByClause {
    fields: OrderByField[]
}

export interface SoqlQuery {
    type: 'soqlQuery'
    select: SelectClause
    from: FromClause
    where?: WhereClause
    groupBy?: GroupByClause
    orderBy?: OrderByClause
    limit?: number
    offset?: number
}
