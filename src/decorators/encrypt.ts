import {
  propertiesByModel,
  propertyReflector,
  IFmModelPropertyMeta,
} from "@/private";

export const encrypt = propertyReflector<IFmModelPropertyMeta>(
  { encrypt: true },
  propertiesByModel
);
