import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { capitalize } from "../../util";
export class MissingReciprocalInverse extends FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-reciprocal-inverse");
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        const pkInverse = rec.META.relationship(property).inverseProperty;
        const fkInverse = (fkRecord.META.relationship(pkInverse) || {})
            .inverseProperty || "undefined";
        const message = `The model "${capitalize(rec.modelName)}" is trying to leverage it's relationship with the model "${capitalize(fkRecord.modelName)}" through the property "${property}" but it appears these two models are in conflict. ${capitalize(rec.modelName)} has been defined to look for an inverse property of "${capitalize(rec.modelName)}.${rec.META.relationship(property).inverseProperty}" but it is missing [ ${fkInverse} ]! Look at your model definitions and make sure this is addressed.`;
        this.message = message;
    }
}
//# sourceMappingURL=MissingReciprocalInverse.js.map