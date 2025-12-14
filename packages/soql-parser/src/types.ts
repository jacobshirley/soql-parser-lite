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
    alias: string
}

export type SelectItem = FieldSelect | AggregateSelect | SubquerySelect

export type ObjectName = string //TODO: more complex object names with namespaces?

export interface FromClause {
    object: ObjectName
    alias?: string
}

export interface LogicalExpr {
    type: 'logical'
    operator: 'AND' | 'OR'
    left: BooleanExpr
    right: BooleanExpr
}

export interface ComparisonExpr {
    type: 'comparison'
    operator: '=' | '!=' | '<' | '<=' | '>' | '>='
    left: FieldPath
    right: ValueExpr
}

export interface InExpr {
    type: 'in'
    field: FieldPath
    values: ValueExpr[]
}

export interface LikeExpr {
    type: 'like'
    field: FieldPath
    pattern: string
}

export interface NullCheckExpr {
    type: 'nullCheck'
    field: FieldPath
    isNull: boolean
}

export interface SemiJoinExpr {
    type: 'semiJoin'
    field: FieldPath
    subquery: SoqlQuery
}

export interface ParenExpr {
    type: 'paren'
    expr: BooleanExpr
}

export type BooleanExpr =
    | LogicalExpr
    | ComparisonExpr
    | InExpr
    | LikeExpr
    | NullCheckExpr
    | SemiJoinExpr
    | ParenExpr

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

export interface DateLiteral {
  type: "dateLiteral"
  value:
    | "TODAY"
    | "YESTERDAY"
    | "TOMORROW"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "NEXT_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "NEXT_MONTH"
    | { type: "LAST_N_DAYS"; n: number }
    | { type: "NEXT_N_DAYS"; n: number }
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
    select: SelectClause
    from: FromClause
    where?: WhereClause
    groupBy?: GroupByClause
    orderBy?: OrderByClause
    limit?: number
    offset?: number
}
