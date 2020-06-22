"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotHasManyRelationship = void 0;
const FireModelError_1 = require("../FireModelError");
class NotHasManyRelationship extends FireModelError_1.FireModelError {
    constructor(rec, property, method) {
        super("", "firemodel/not-hasMany-reln");
        this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasMany relationship`;
    }
}
exports.NotHasManyRelationship = NotHasManyRelationship;
//# sourceMappingURL=NotHasManyRelationship.js.map