"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireModelError_1 = require("../FireModelError");
const Record_1 = require("../../Record");
const MissingReciprocalInverse_1 = require("./MissingReciprocalInverse");
class IncorrectReciprocalInverse extends FireModelError_1.FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-reciprocal-inverse");
        let message;
        const fkRecord = Record_1.Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        const inverseProperty = rec.META.relationship(property).inverseProperty;
        const fkInverse = fkRecord.META.relationship(inverseProperty);
        if (!fkInverse) {
            const e = new MissingReciprocalInverse_1.MissingReciprocalInverse(rec, property);
            throw e;
        }
        else {
            const recipricalInverse = fkInverse.inverseProperty;
            message = `The model ${rec.modelName} is trying to leverage it's relationship with ${fkRecord.modelName} but it appears these two models are in conflict! ${rec.modelName} has been defined to look for an inverse property of "${inverseProperty}" but on ${fkRecord.modelName} model the inverse property points back to a property of "${recipricalInverse}"! Look at your model definitions and make sure this is addressed.`;
        }
        this.message = message;
    }
}
exports.IncorrectReciprocalInverse = IncorrectReciprocalInverse;
//# sourceMappingURL=IncorrectReciprocalInverse.js.map