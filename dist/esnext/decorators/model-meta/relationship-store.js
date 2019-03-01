import { hashToArray } from "typed-conversions";
export const relationshipsByModel = {};
/** allows the addition of meta information to be added to a model's relationships */
export function addRelationshipToModelMeta(modelName, property, meta) {
    if (!relationshipsByModel[modelName]) {
        relationshipsByModel[modelName] = {};
    }
    relationshipsByModel[modelName][property] = meta;
}
export function isRelationship(modelKlass) {
    return (prop) => {
        return getModelRelationship(modelKlass)(prop) ? true : false;
    };
}
export function getModelRelationship(model) {
    const relnsForModel = getRelationships(model);
    const className = model.constructor.name;
    return (prop) => {
        return relnsForModel.find(value => {
            return value.property === prop;
        });
    };
}
/**
 * Gets all the relationships for a given model
 */
export function getRelationships(model) {
    const modelName = model.constructor.name;
    const properties = hashToArray(relationshipsByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...hashToArray(relationshipsByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties;
}
//# sourceMappingURL=relationship-store.js.map