import { FireModelError } from "./FireModelError";
import { Record } from "../Record";
import { Model } from "../models/Model";

export class DynamicPropertiesNotReady<T extends Model> extends FireModelError {
  constructor(rec: Record<T>, message?: string) {
    message = message
      ? message
      : `An attempt to interact with the record ${
          rec.modelName
        } in a way that requires that the fully composite key be specified. The required parameters for this model to be ready for this are: ${rec.dynamicPathComponents.join(
          ", "
        )}.`;
    super(message, "firemodel/dynamic-properties-not-ready");
  }
}
