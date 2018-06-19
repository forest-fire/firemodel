import "reflect-metadata";
import { set, get } from "lodash";
function push(target, path, value) {
    if (Array.isArray(get(target, path))) {
        get(target, path).push(value);
    }
    else {
        set(target, path, [value]);
    }
}
/** Properties accumlated by propertyDecorators and grouped by schema */
const propertiesBySchema = {};
/** Relationships accumlated by propertyDecorators and grouped by schema */
const relationshipsBySchema = {};
export const propertyDecorator = (nameValuePairs = {}, 
/**
 * if you want to set the property being decorated's name
 * as property on meta specify the meta properties name here
 */
property) => (target, key) => {
    const reflect = Reflect.getMetadata("design:type", target, key) || {};
    const meta = Object.assign({}, Reflect.getMetadata(key, target), { type: reflect.name }, nameValuePairs);
    Reflect.defineMetadata(key, meta, target);
    // const _val: any = this[key];
    if (nameValuePairs.isProperty) {
        if (property) {
            push(propertiesBySchema, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(propertiesBySchema, target.constructor.name, meta);
        }
    }
    if (nameValuePairs.isRelationship) {
        if (property) {
            push(relationshipsBySchema, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(relationshipsBySchema, target.constructor.name, meta);
        }
    }
};
/** lookup meta data for schema properties */
function propertyMeta(context) {
    return (prop) => Reflect.getMetadata(prop, context);
}
/**
 * Give all properties from schema and base schema
 *
 * @param target the schema object which is being looked up
 */
export function getProperties(target) {
    return [
        ...propertiesBySchema[target.constructor.name],
        ...propertiesBySchema.Model.map(s => (Object.assign({}, s, { isBaseSchema: true })))
    ];
}
export function getRelationships(target) {
    return relationshipsBySchema[target.constructor.name];
}
export function getPushKeys(target) {
    const props = getProperties(target);
    return props.filter(p => p.pushKey).map(p => p.property);
}
//# sourceMappingURL=decorator.js.map