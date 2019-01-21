"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const lodash_1 = require("lodash");
const typed_conversions_1 = require("typed-conversions");
function push(target, path, value) {
    if (Array.isArray(lodash_1.get(target, path))) {
        lodash_1.get(target, path).push(value);
    }
    else {
        lodash_1.set(target, path, [value]);
    }
}
/** Properties accumlated by propertyDecorators  */
exports.propertiesByModel = {};
/** Relationships accumlated by hasMany/hasOne decorators */
exports.relationshipsByModel = {};
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
            push(exports.propertiesByModel, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(exports.propertiesByModel, target.constructor.name, meta);
        }
    }
    if (nameValuePairs.isRelationship) {
        if (property) {
            push(exports.relationshipsByModel, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(exports.relationshipsByModel, target.constructor.name, meta);
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
 * @param model the schema object which is being looked up
 */
function getProperties(model) {
    const modelName = model.constructor.name;
    const baseModel = typed_conversions_1.hashToArray(exports.propertiesByModel.Model, "property");
    const subClass = modelName === "Model"
        ? []
        : typed_conversions_1.hashToArray(exports.propertiesByModel[modelName], "property");
    return [...subClass, ...baseModel];
}
exports.getProperties = getProperties;
/**
 * Gets all the relationships for a given model
 */
function getRelationships(model) {
    const modelName = model.constructor.name;
    const modelRelationships = exports.relationshipsByModel[modelName];
    return typed_conversions_1.hashToArray(modelRelationships, "property");
}
exports.getRelationships = getRelationships;
function getPushKeys(target) {
    const props = getProperties(target);
    return props.filter(p => p.pushKey).map(p => p.property);
}
exports.getPushKeys = getPushKeys;
//# sourceMappingURL=decorator.js.map