/**
 * Union type representing valid stream input formats.
 */
export type StreamInput = string | number | number[] | Uint8Array

/**
 * An async iterable stream of input that can be consumed incrementally.
 * Supports strings, numbers, arrays of numbers, or Uint8Arrays as stream items.
 */
export type ByteStream = AsyncIterable<StreamInput> | Iterable<StreamInput>

export const OPERATORS = [
    '=',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'LIKE',
    'NLIKE',
    'IN',
    'NIN',
    'INCLUDES',
    'EXCLUDES',
] as const

export type SoqlOperator = (typeof OPERATORS)[number]

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
 * List of all valid SOQL keywords recognized by the parser.
 * @internal
 */
export const SOQL_KEYWORDS = [
    ...OPERATORS,
    'SELECT',
    'FROM',
    'WHERE',
    'AND',
    'OR',
    'IN',
    'LIKE',
    'COUNT',
    'MAX',
    'MIN',
    'SUM',
    'AVG',
    'ASC',
    'DESC',
    'EXCLUDES',
    'FIRST',
    'GROUP',
    'HAVING',
    'INCLUDES',
    'LAST',
    'LIMIT',
    'NOT',
    'NULL',
    'NULLS',
    'USING',
    'WITH',
    'ORDER',
    'BY',
    'OFFSET',
    'ROLLUP',
    'CUBE',
    'DISTINCT',
] as const

/**
 * Valid SOQL keywords that can be used in queries.
 */
export type SoqlKeyword = (typeof SOQL_KEYWORDS)[number]
