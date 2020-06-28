import { FireModelError, MissingReciprocalInverse } from "@/errors";
import { IModel, IRecord } from "@/types";

import { capitalize } from "@/util";

export class IncorrectReciprocalInverse<
  T extends IModel
> extends FireModelError {
  constructor(rec: IRecord<T>, property: keyof T & string) {
    super("", "firemodel/missing-reciprocal-inverse");

    let message: string;
    const relationship = rec.getMetaForRelationship(property);
    const inverseProperty = rec.META.relationship(property).inverseProperty;
    if (relationship.inverseIsMissing) {
      const e = new MissingReciprocalInverse(rec, property);
      throw e;
    } else {
      const recipricalInverse = relationship.fkReciprocalInverseProperty;
      message = `The model ${
        rec.modelName
      } is trying to leverage it's relationship with ${capitalize(
        relationship.modelName
      )} but it appears these two models are in conflict! ${
        rec.modelName
      } has been defined to look for an inverse property of "${inverseProperty}" but on ${
        relationship.modelName
      } model the inverse property points back to a property of "${recipricalInverse}"! Look at your model definitions and make sure this is addressed.`;
    }
    this.message = message;
  }
}
