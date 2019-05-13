import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { MissingReciprocalInverse } from "./MissingReciprocalInverse";
export class IncorrectReciprocalInverse extends FireModelError {
    constructor(rec, property) {
        let message;
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor());
        const inverseProperty = rec.META.relationship(property).inverseProperty;
        const fkInverse = fkRecord.META.relationship(inverseProperty);
        if (!fkInverse) {
            const e = new MissingReciprocalInverse(rec, property);
            throw e;
        }
        else {
            const recipricalInverse = fkInverse.inverseProperty;
            message = `The model ${rec.modelName} is trying to leverage it's relationship with ${fkRecord.modelName} but it appears these two models are in conflict! ${rec.modelName} has been defined to look for an inverse property of "${inverseProperty}" but on ${fkRecord.modelName} model the inverse property points back to a property of "${recipricalInverse}"! Look at your model definitions and make sure this is addressed.`;
        }
        super(message, "firemodel/missing-reciprocal-inverse");
    }
}
//# sourceMappingURL=IncorrectReciprocalInverse.js.map