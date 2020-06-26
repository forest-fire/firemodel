import { propertiesByModel, propertyReflector } from "@/decorators/shared";

import { IFmModelPropertyMeta } from "@types";

export const encrypt = propertyReflector<IFmModelPropertyMeta>(
  { encrypt: true },
  propertiesByModel
);
