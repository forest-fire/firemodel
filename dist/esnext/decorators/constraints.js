import "reflect-metadata";
import { propertyReflector } from "./reflector";
import { propertiesByModel } from "./model-meta/property-store";
export function constrainedProperty(options = {}) {
    return propertyReflector(Object.assign(Object.assign({}, options), { isRelationship: false, isProperty: true }), propertiesByModel);
}
/** allows the introduction of a new constraint to the metadata of a property */
export function constrain(prop, value) {
    return propertyReflector({ [prop]: value }, propertiesByModel);
}
export function desc(value) {
    return propertyReflector({ desc: value }, propertiesByModel);
}
export function min(value) {
    return propertyReflector({ min: value }, propertiesByModel);
}
export function mock(value, ...rest) {
    return propertyReflector({ mockType: value, mockParameters: rest }, propertiesByModel);
}
export function max(value) {
    return propertyReflector({ max: value }, propertiesByModel);
}
export function length(value) {
    return propertyReflector({ length: value }, propertiesByModel);
}
export const property = propertyReflector({
    isRelationship: false,
    isProperty: true
}, propertiesByModel);
export const pushKey = propertyReflector({ pushKey: true }, propertiesByModel);
//# sourceMappingURL=constraints.js.map