import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { capitalize } from "../../util";
/**
 * When the record's META points to a inverse property on the FK; this error
 * presents when that `FK[inverseProperty]` doesn't exist in the FK's meta.
 */
export class MissingInverseProperty extends FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-inverse-property");
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        this.from = capitalize(rec.modelName);
        this.to = capitalize(fkRecord.modelName);
        const pkInverse = rec.META.relationship(property).inverseProperty;
        this.inverseProperty = pkInverse;
        const message = `Missing Inverse Property: the model "${this.from}" has defined a relationship with the "${this.to}" model where the FK property is "${property}" and it states that the "inverse property" is "${pkInverse}" on the ${this.to} model. Unfortunately the ${this.to} model does NOT define a property called "${this.inverseProperty}".`;
        this.message = message;
    }
}
//# sourceMappingURL=MissingInverseProperty.js.map