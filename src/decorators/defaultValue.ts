import { propertyReflector } from "./reflector";
import { IFmModelPropertyMeta, FmMockType } from ".";
import { propertiesByModel } from "./model-meta/property-store";

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
