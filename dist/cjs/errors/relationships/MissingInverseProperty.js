"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingInverseProperty = void 0;
const FireModelError_1 = require("../FireModelError");
const Record_1 = require("../../Record");
const util_1 = require("../../util");
/**
 * When the record's META points to a inverse property on the FK; this error
 * presents when that `FK[inverseProperty]` doesn't exist in the FK's meta.
 */
class MissingInverseProperty extends FireModelError_1.FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-inverse-property");
        const fkRecord = Record_1.Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        this.from = util_1.capitalize(rec.modelName);
        this.to = util_1.capitalize(fkRecord.modelName);
        const pkInverse = rec.META.relationship(property).inverseProperty;
        this.inverseProperty = pkInverse;
        const message = `Missing Inverse Property: the model "${this.from}" has defined a relationship with the "${this.to}" model where the FK property is "${property}" and it states that the "inverse property" is "${pkInverse}" on the ${this.to} model. Unfortunately the ${this.to} model does NOT define a property called "${this.inverseProperty}".`;
        this.message = message;
    }
}
exports.MissingInverseProperty = MissingInverseProperty;
//# sourceMappingURL=MissingInverseProperty.js.map