import { propertiesByModel, propertyReflector } from "@decorators";

import { IFmModelPropertyMeta } from "@types";

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
