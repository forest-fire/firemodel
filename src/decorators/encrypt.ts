import { propertiesByModel, propertyReflector } from "@decorators";

import { IFmModelPropertyMeta } from "@types";

export const encrypt = propertyReflector<IFmModelPropertyMeta>(
  { encrypt: true },
  propertiesByModel
);
