import { BYTE_MAP } from '../byte-map.js'
import { SoqlParserError } from '../errors.js'
import { SoqlBase } from './core/SoqlBase.js'
import { SoqlStringBuffer } from './core/SoqlStringBuffer.js'

export const DATA_CATEGORY_SELECTORS = [
    'AT',
    'ABOVE',
    'BELOW',
    'ABOVE_OR_BELOW',
] as const

export type SoqlDataCategorySelector = (typeof DATA_CATEGORY_SELECTORS)[number]

/**
 * One `<group> AT|ABOVE|BELOW|ABOVE_OR_BELOW <category | (categories)>` filter
 * of a `WITH DATA CATEGORY` clause.
 */
export class SoqlDataCategoryFilter extends SoqlBase {
    group: string
    selector: SoqlDataCategorySelector
    categories: string[]

    constructor(options: {
        group: string
        selector: SoqlDataCategorySelector
        categories: string[]
    }) {
        super()
        this.group = options.group
        this.selector = options.selector
        this.categories = options.categories
    }
}

export type SoqlWithKind =
    | 'SECURITY_ENFORCED'
    | 'USER_MODE'
    | 'SYSTEM_MODE'
    | 'DATA_CATEGORY'

/**
 * A `WITH SECURITY_ENFORCED | USER_MODE | SYSTEM_MODE` or
 * `WITH DATA CATEGORY ...` clause.
 */
export class SoqlWithClause extends SoqlBase {
    kind: SoqlWithKind
    dataCategories?: SoqlDataCategoryFilter[]

    constructor(options: {
        kind: SoqlWithKind
        dataCategories?: SoqlDataCategoryFilter[]
    }) {
        super()
        this.kind = options.kind
        if (options.dataCategories) {
            this.dataCategories = options.dataCategories
        }
    }

    static fromString(string: string): SoqlWithClause {
        return SoqlWithClause.fromBuffer(new SoqlStringBuffer(string))
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlWithClause {
        const keyword = buffer.readKeyword()
        if (keyword !== 'WITH') {
            throw new SoqlParserError(`Expected WITH keyword, got: ${keyword}`)
        }

        const word = buffer.readString().toUpperCase()
        switch (word) {
            case 'SECURITY_ENFORCED':
            case 'USER_MODE':
            case 'SYSTEM_MODE':
                return new SoqlWithClause({ kind: word })
            case 'DATA': {
                const category = buffer.readString().toUpperCase()
                if (category !== 'CATEGORY') {
                    throw new SoqlParserError(
                        `Expected CATEGORY after WITH DATA, got: ${category}`,
                    )
                }
                const dataCategories = [
                    SoqlWithClause.readCategoryFilter(buffer),
                ]
                while (buffer.peekKeyword() === 'AND') {
                    buffer.readKeyword()
                    dataCategories.push(
                        SoqlWithClause.readCategoryFilter(buffer),
                    )
                }
                return new SoqlWithClause({
                    kind: 'DATA_CATEGORY',
                    dataCategories,
                })
            }
            default:
                throw new SoqlParserError(
                    `Unsupported WITH clause: ${word || 'end of input'}`,
                )
        }
    }

    private static readCategoryFilter(
        buffer: SoqlStringBuffer,
    ): SoqlDataCategoryFilter {
        const group = buffer.readString()
        const selector = buffer.readString().toUpperCase()
        if (
            !group ||
            !(DATA_CATEGORY_SELECTORS as readonly string[]).includes(selector)
        ) {
            throw new SoqlParserError(
                `Expected "<group> AT|ABOVE|BELOW|ABOVE_OR_BELOW <category>" in WITH DATA CATEGORY, got: ${group} ${selector}`.trim(),
            )
        }

        buffer.skipWhitespace()
        const categories: string[] = []
        if (buffer.peek() === BYTE_MAP.openParen) {
            buffer.expect(BYTE_MAP.openParen)
            while (true) {
                categories.push(SoqlWithClause.readCategory(buffer))
                buffer.skipWhitespace()
                if (buffer.peek() === BYTE_MAP.comma) {
                    buffer.expect(BYTE_MAP.comma)
                } else {
                    break
                }
            }
            buffer.skipWhitespace()
            buffer.expect(BYTE_MAP.closeParen)
        } else {
            categories.push(SoqlWithClause.readCategory(buffer))
        }

        return new SoqlDataCategoryFilter({
            group,
            selector: selector as SoqlDataCategorySelector,
            categories,
        })
    }

    private static readCategory(buffer: SoqlStringBuffer): string {
        const name = buffer.readString()
        if (!name) {
            throw new SoqlParserError('Expected a data category name')
        }
        return name
    }
}
