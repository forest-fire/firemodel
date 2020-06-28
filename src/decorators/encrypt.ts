import { IFmModelPropertyMeta } from "@/types";
import { propertiesByModel } from "@/util";
import { propertyReflector } from "@/decorators";

export const encrypt = propertyReflector<IFmModelPropertyMeta>(
  { encrypt: true },
  propertiesByModel
);
