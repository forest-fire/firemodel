import {
  IFmModelPropertyMeta,
  propertiesByModel,
  propertyReflector,
} from "@/private";

// TODO: make the defaultValue typed
/**
 * Allows setting a default value for a given property
 */
export function defaultValue(value: any) {
  return propertyReflector<IFmModelPropertyMeta>(
    { defaultValue: value },
    propertiesByModel
  );
}
