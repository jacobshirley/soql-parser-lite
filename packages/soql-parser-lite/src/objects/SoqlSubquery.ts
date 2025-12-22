import { SoqlBase } from './core/SoqlBase'
import { SoqlStringBuffer } from './core/SoqlStringBuffer'
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
