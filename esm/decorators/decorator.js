import "reflect-metadata";
function push(target, path, value) {
    if (Array.isArray(get(target, path))) {
        get(target, path).push(value);
    }
    else {
        set(target, path, [value]);
    }
}
const propertiesBySchema = {};
const relationshipsBySchema = {};
export const propertyDecorator = (nameValuePairs = {}, property) => (target, key) => {
    const reflect = Reflect.getMetadata("design:type", target, key);
    const meta = Object.assign({}, Reflect.getMetadata(key, target), { type: reflect.name }, nameValuePairs);
    Reflect.defineMetadata(key, meta, target);
    const _val = this[key];
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
function propertyMeta(context) {
    return (prop) => Reflect.getMetadata(prop, context);
}
export function getProperties(target) {
    return [
        ...propertiesBySchema[target.constructor.name],
        ...propertiesBySchema.BaseSchema.map(s => (Object.assign({}, s, { isBaseSchema: true })))
    ];
}
export function getRelationships(target) {
    return relationshipsBySchema[target.constructor.name];
}
export function getPushKeys(target) {
    const props = getProperties(target);
    return props.filter(p => p.pushKey).map(p => p.property);
}
