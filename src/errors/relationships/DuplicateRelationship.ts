import { FireModelError, Model } from "@/private";

export class DuplicateRelationship<
  P extends Model,
  F extends Model
> extends FireModelError {
  constructor(pk: P, property: string, fkId: string) {
    const fkConstructor = pk.META.relationship("property").fkConstructor();
    const fkModel = new fkConstructor();
    const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" already had that relationship defined! You can either set the "duplicationIsError" to "false" (the default) or treat this as an error and fix`;
    super(message, "firemodel/duplicate-relationship");
  }
}
