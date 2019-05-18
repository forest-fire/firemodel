import { FireModelError } from "../FireModelError";
export class NotHasOneRelationship extends FireModelError {
    constructor(rec, property, method) {
        super("", "firemodel/not-hasOne-reln");
        this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasOne relationship`;
    }
}
//# sourceMappingURL=NotHasOneRelationship.js.map