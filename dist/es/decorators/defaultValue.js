import { propertyReflector } from "./reflector";
import { propertiesByModel } from "./model-meta/property-store";
// TODO: make the defaultValue typed
/**
 * Allows setting a default value for a given property
 */
export function defaultValue(value) {
    return propertyReflector({ defaultValue: value }, propertiesByModel);
}
//# sourceMappingURL=defaultValue.js.map