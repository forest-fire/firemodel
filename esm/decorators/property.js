import "reflect-metadata";
import { propertyDecorator } from "./decorator";
export function constrainedProperty(options = {}) {
    return propertyDecorator(Object.assign({}, options, { isRelationship: false, isProperty: true }), "property");
}
export function constrain(prop, value) {
    return propertyDecorator({ [prop]: value });
}
export function desc(value) {
    return propertyDecorator({ desc: value });
}
export function min(value) {
    return propertyDecorator({ min: value });
}
export function max(value) {
    return propertyDecorator({ max: value });
}
export function length(value) {
    return propertyDecorator({ length: value });
}
export const property = propertyDecorator({
    isRelationship: false,
    isProperty: true
}, "property");
export const pushKey = propertyDecorator({
    pushKey: true
}, "property");
