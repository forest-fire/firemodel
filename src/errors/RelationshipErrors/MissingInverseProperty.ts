import { IModel, IRecord } from "@/types";

import { FireModelError } from "@/errors";
import { capitalize } from "@/util";

/**
 * When the record's META points to a inverse property on the FK; this error
 * presents when that `FK[inverseProperty]` doesn't exist in the FK's meta.
 */
export class MissingInverseProperty<T extends IModel> extends FireModelError {
  public from: string;
  public to: string;
  public inverseProperty: string;

  constructor(rec: IRecord<T>, property: keyof T & string) {
    super("", "firemodel/missing-inverse-property");

    const fkMeta = rec.getMetaForRelationship(property);

    this.from = capitalize(rec.modelName);
    this.to = capitalize(fkMeta.modelName);
    const pkInverse = rec.META.relationship(property).inverseProperty;
    this.inverseProperty = pkInverse;

    const message = `Missing Inverse Property: the model "${this.from}" has defined a relationship with the "${this.to}" model where the FK property is "${property}" and it states that the "inverse property" is "${pkInverse}" on the ${this.to} model. Unfortunately the ${this.to} model does NOT define a property called "${this.inverseProperty}".`;
    this.message = message;
  }
}
