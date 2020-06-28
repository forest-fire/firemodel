import { IModel, IRecord } from "@/types";

import { FireModelError } from "@/errors";

export class DynamicPropertiesNotReady<
  T extends IModel
> extends FireModelError {
  constructor(rec: IRecord<T>, message?: string) {
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
