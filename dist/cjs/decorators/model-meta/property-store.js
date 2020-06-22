"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperties = exports.getModelProperty = exports.addPropertyToModelMeta = exports.propertiesByModel = exports.isProperty = void 0;
const typed_conversions_1 = require("typed-conversions");
function isProperty(modelKlass) {
    return (prop) => {
        return getModelProperty(modelKlass)(prop) ? true : false;
    };
}
exports.isProperty = isProperty;
/** Properties accumlated by propertyDecorators  */
exports.propertiesByModel = {};
/** allows the addition of meta information to be added to a model's properties */
function addPropertyToModelMeta(modelName, property, meta) {
    if (!exports.propertiesByModel[modelName]) {
        exports.propertiesByModel[modelName] = {};
    }
    // TODO: investigate why we need to genericize to model (from <T>)
    exports.propertiesByModel[modelName][property] = meta;
}
exports.addPropertyToModelMeta = addPropertyToModelMeta;
/** lookup meta data for schema properties */
function getModelProperty(model) {
    const className = model.constructor.name;
    const propsForModel = getProperties(model);
    return (prop) => {
        return propsForModel.find(value => {
            return value.property === prop;
        });
    };
}
exports.getModelProperty = getModelProperty;
/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
function getProperties(model) {
    const modelName = model.constructor.name;
    const properties = typed_conversions_1.hashToArray(exports.propertiesByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...typed_conversions_1.hashToArray(exports.propertiesByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties;
}
exports.getProperties = getProperties;
//# sourceMappingURL=property-store.js.map