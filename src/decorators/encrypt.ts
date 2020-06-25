import {
  IFmModelPropertyMeta,
  propertiesByModel,
  propertyReflector,
} from "@/private";

export const encrypt = propertyReflector<IFmModelPropertyMeta>(
  { encrypt: true },
  propertiesByModel
);
