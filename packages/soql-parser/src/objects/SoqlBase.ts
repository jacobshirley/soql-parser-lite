export abstract class SoqlBase {
    get type(): string {
        return this.constructor.name
    }
}
