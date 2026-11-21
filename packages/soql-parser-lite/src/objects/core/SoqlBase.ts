export abstract class SoqlBase {
    get type(): string {
        return this.constructor.name
    }

    /**
     * Includes the node `type` (a prototype getter, which `JSON.stringify` would
     * otherwise skip) so serialised queries keep the node kind and operator.
     */
    toJSON(): Record<string, unknown> {
        return { type: this.type, ...(this as object) }
    }
}
