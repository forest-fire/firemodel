import { FireModelError } from "@/errors";
import { IModel } from "@/types";

export class FkDoesNotExist<
  P extends IModel,
  F extends IModel
> extends FireModelError {
  constructor(pk: P, property: string, fkId: string) {
    // TODO: is this typing right for constructor?
    const fkConstructor = pk.META.relationship("property").fkConstructor();
    const fkModel = new fkConstructor();
    const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" doesn't exist!`;
    super(message, "firemodel/fk-does-not-exist");
  }
}
