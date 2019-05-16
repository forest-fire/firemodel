"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireModelError_1 = require("../FireModelError");
class NotHasOneRelationship extends FireModelError_1.FireModelError {
    constructor(rec, property, method) {
        super("", "firemodel/not-hasOne-reln");
        this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasOne relationship`;
    }
}
exports.NotHasOneRelationship = NotHasOneRelationship;
//# sourceMappingURL=NotHasOneRelationship.js.map