"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typed_conversions_1 = require("typed-conversions");
exports.relationshipsByModel = {};
/** allows the addition of meta information to be added to a model's relationships */
function addRelationshipToModelMeta(modelName, property, meta) {
    if (!exports.relationshipsByModel[modelName]) {
        exports.relationshipsByModel[modelName] = {};
    }
    exports.relationshipsByModel[modelName][property] = meta;
}
exports.addRelationshipToModelMeta = addRelationshipToModelMeta;
function isRelationship(modelKlass) {
    return (prop) => {
        return getModelRelationship(modelKlass)(prop) ? true : false;
    };
}
exports.isRelationship = isRelationship;
function getModelRelationship(model) {
    const relnsForModel = getRelationships(model);
    const className = model.constructor.name;
    return (prop) => {
        return relnsForModel.find(value => {
            return value.property === prop;
        });
    };
}
exports.getModelRelationship = getModelRelationship;
/**
 * Gets all the relationships for a given model
 */
function getRelationships(model) {
    const modelName = model.constructor.name;
    const properties = typed_conversions_1.hashToArray(exports.relationshipsByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...typed_conversions_1.hashToArray(exports.relationshipsByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties;
}
exports.getRelationships = getRelationships;
//# sourceMappingURL=relationship-store.js.map