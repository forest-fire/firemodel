import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../Model";
import { MissingReciprocalInverse } from "./MissingReciprocalInverse";

export class IncorrectReciprocalInverse<
  T extends Model
> extends FireModelError {
  constructor(rec: Record<T>, property: keyof T & string) {
    super("", "firemodel/missing-reciprocal-inverse");

    let message: string;
    const fkRecord = Record.create(
      rec.META.relationship(property).fkConstructor(), { db: rec.db }
    );
    const inverseProperty = rec.META.relationship(property).inverseProperty;
    const fkInverse = fkRecord.META.relationship(inverseProperty as any);
    if (!fkInverse) {
      const e = new MissingReciprocalInverse(rec, property);
      throw e;
    } else {
      const recipricalInverse = fkInverse.inverseProperty;
      message = `The model ${rec.modelName} is trying to leverage it's relationship with ${fkRecord.modelName} but it appears these two models are in conflict! ${rec.modelName} has been defined to look for an inverse property of "${inverseProperty}" but on ${fkRecord.modelName} model the inverse property points back to a property of "${recipricalInverse}"! Look at your model definitions and make sure this is addressed.`;
    }
    this.message = message;
  }
}
