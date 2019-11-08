import "reflect-metadata";
import get from "get-value";
import set from "set-value";
import { getProperties, addPropertyToModelMeta } from "./model-meta/property-store";
import { addRelationshipToModelMeta } from "./model-meta/relationship-store";
function push(target, path, value) {
    if (Array.isArray(get(target, path))) {
        get(target, path).push(value);
    }
    else {
        set(target, path, [value]);
    }
}
export const propertyDecorator = (nameValuePairs = {}, 
/**
 * if you want to set the property being decorated's name
 * as property on meta specify the meta properties name here
 */
property) => (target, key) => {
    const reflect = Reflect.getMetadata("design:type", target, key) || {};
    if (nameValuePairs.isProperty) {
        const meta = Object.assign({}, Reflect.getMetadata(key, target), { type: reflect.name }, nameValuePairs);
        Reflect.defineMetadata(key, meta, target);
        addPropertyToModelMeta(target.constructor.name, property, meta);
    }
    if (nameValuePairs.isRelationship) {
        const meta = Object.assign({}, Reflect.getMetadata(key, target), { type: reflect.name }, nameValuePairs);
        Reflect.defineMetadata(key, meta, target);
        addRelationshipToModelMeta(target.constructor.name, property, meta);
    }
};
/** lookup meta data for schema properties */
function propertyMeta(context) {
    return (prop) => Reflect.getMetadata(prop, context);
}
export function getPushKeys(target) {
    const props = getProperties(target);
    return props.filter(p => p.pushKey).map(p => p.property);
}
//# sourceMappingURL=decorator.js.map