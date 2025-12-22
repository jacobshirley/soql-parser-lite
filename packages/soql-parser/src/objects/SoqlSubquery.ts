import { SoqlBase } from './SoqlBase'
import { SoqlStringBuffer } from './SoqlStringBuffer'
import { SoqlQuery } from './SoqlQuery'

export class SoqlSubquery extends SoqlBase {
    subquery: SoqlQuery

    constructor(options: { subquery: SoqlQuery }) {
        super()
        this.subquery = options.subquery
    }

    static fromString(string: string): SoqlSubquery {
        const stringBuffer = new SoqlStringBuffer(string)
        return SoqlSubquery.fromBuffer(stringBuffer)
    }

    static fromBuffer(buffer: SoqlStringBuffer): SoqlSubquery {
        const subquery = SoqlQuery.fromBuffer(buffer)
        return new SoqlSubquery({ subquery })
    }
}
