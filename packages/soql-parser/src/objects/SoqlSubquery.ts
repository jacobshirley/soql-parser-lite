import { SoqlObject } from './SoqlObject'
import { SoqlStringBuffer } from './SoqlStringBuffer'
import { SoqlQuery } from './SoqlQuery'

export class SoqlSubquery extends SoqlObject {
    subquery: SoqlQuery
    constructor(subquery: SoqlQuery) {
        super()
        this.subquery = subquery
    }

    static fromString(string: string): SoqlSubquery {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSubquery.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSubquery {
        const subquery = SoqlQuery.fromBuffer(buffer)
        return new SoqlSubquery(subquery)
    }
}
