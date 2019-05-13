import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../Model";
import { capitalize } from "../../util";

export class MissingReciprocalInverse<T extends Model> extends FireModelError {
  constructor(rec: Record<T>, property: keyof T) {
    super("", "firemodel/missing-reciprocal-inverse");

    const fkRecord = Record.create(
      rec.META.relationship(property).fkConstructor()
    );
    const pkInverse = rec.META.relationship(property).inverseProperty;
    const fkInverse =
      (fkRecord.META.relationship(pkInverse as any) || ({} as any))
        .inverseProperty || "undefined";
    const message = `The model "${capitalize(
      rec.modelName
    )}" is trying to leverage it's relationship with the model "${capitalize(
      fkRecord.modelName
    )}" through the property "${property}" but it appears these two models are in conflict. ${capitalize(
      rec.modelName
    )} has been defined to look for an inverse property of "${capitalize(
      rec.modelName
    )}.${
      rec.META.relationship(property).inverseProperty
    }" but it is missing [ ${fkInverse} ]! Look at your model definitions and make sure this is addressed.`;
    this.message = message;
  }
}
