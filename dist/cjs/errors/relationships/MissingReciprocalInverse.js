"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingReciprocalInverse = void 0;
const FireModelError_1 = require("../FireModelError");
const Record_1 = require("../../Record");
const util_1 = require("../../util");
class MissingReciprocalInverse extends FireModelError_1.FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-reciprocal-inverse");
        const fkRecord = Record_1.Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        const pkInverse = rec.META.relationship(property).inverseProperty;
        const fkInverse = (fkRecord.META.relationship(pkInverse) || {})
            .inverseProperty || "undefined";
        const message = `The model "${util_1.capitalize(rec.modelName)}" is trying to leverage it's relationship with the model "${util_1.capitalize(fkRecord.modelName)}" through the property "${property}" but it appears these two models are in conflict. ${util_1.capitalize(rec.modelName)} has been defined to look for an inverse property of "${util_1.capitalize(rec.modelName)}.${rec.META.relationship(property).inverseProperty}" but it is missing [ ${fkInverse} ]! Look at your model definitions and make sure this is addressed.`;
        this.message = message;
    }
}
exports.MissingReciprocalInverse = MissingReciprocalInverse;
//# sourceMappingURL=MissingReciprocalInverse.js.map