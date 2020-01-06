"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireModelError_1 = require("../FireModelError");
class DuplicateRelationship extends FireModelError_1.FireModelError {
    constructor(pk, property, fkId) {
        const fkConstructor = pk.META.relationship("property").fkConstructor();
        const fkModel = new fkConstructor();
        const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" already had that relationship defined! You can either set the "duplicationIsError" to "false" (the default) or treat this as an error and fix`;
        super(message, "firemodel/duplicate-relationship");
    }
}
exports.DuplicateRelationship = DuplicateRelationship;
//# sourceMappingURL=DuplicateRelationship.js.map