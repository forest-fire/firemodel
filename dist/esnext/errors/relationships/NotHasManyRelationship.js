import { FireModelError } from "../FireModelError";
export class NotHasManyRelationship extends FireModelError {
    constructor(rec, property, method) {
        super("", "firemodel/not-hasMany-reln");
        this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasMany relationship`;
    }
}
//# sourceMappingURL=NotHasManyRelationship.js.map