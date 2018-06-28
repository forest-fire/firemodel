"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const lodash_1 = require("lodash");
function push(target, path, value) {
    if (Array.isArray(lodash_1.get(target, path))) {
        lodash_1.get(target, path).push(value);
    }
    else {
        lodash_1.set(target, path, [value]);
    }
}
/** Properties accumlated by propertyDecorators  */
const propertiesByModel = {};
/** Relationships accumlated by hasMany/ownedBy decorators */
const relationshipsByModel = {};
exports.propertyDecorator = (nameValuePairs = {}, 
/**
 * if you want to set the property being decorated's name
 * as property on meta specify the meta properties name here
 */
property) => (target, key) => {
    const reflect = Reflect.getMetadata("design:type", target, key) || {};
    const meta = Object.assign({}, Reflect.getMetadata(key, target), { type: reflect.name }, nameValuePairs);
    Reflect.defineMetadata(key, meta, target);
    if (nameValuePairs.isProperty) {
        if (property) {
            push(propertiesByModel, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(propertiesByModel, target.constructor.name, meta);
        }
    }
    if (nameValuePairs.isRelationship) {
        if (property) {
            push(relationshipsByModel, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(relationshipsByModel, target.constructor.name, meta);
        }
    }
};
/** lookup meta data for schema properties */
function propertyMeta(context) {
    return (prop) => Reflect.getMetadata(prop, context);
}
/**
 * Gets all the properties for a given model
 *
 * @param target the schema object which is being looked up
 */
function getProperties(target) {
    return [
        ...propertiesByModel[target.constructor.name],
        ...propertiesByModel.Model.map(s => (Object.assign({}, s, { isModel: true })))
    ];
}
exports.getProperties = getProperties;
/**
 * Gets all the relationships for a given model
 */
function getRelationships(target) {
    return relationshipsByModel[target.constructor.name];
}
exports.getRelationships = getRelationships;
function getPushKeys(target) {
    const props = getProperties(target);
    return props.filter(p => p.pushKey).map(p => p.property);
}
exports.getPushKeys = getPushKeys;
//# sourceMappingURL=decorator.js.map