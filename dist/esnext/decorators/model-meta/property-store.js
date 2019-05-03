import { hashToArray } from "typed-conversions";
export function isProperty(modelKlass) {
    return (prop) => {
        return getModelProperty(modelKlass)(prop) ? true : false;
    };
}
/** Properties accumlated by propertyDecorators  */
export const propertiesByModel = {};
/** allows the addition of meta information to be added to a model's properties */
export function addPropertyToModelMeta(modelName, property, meta) {
    if (!propertiesByModel[modelName]) {
        propertiesByModel[modelName] = {};
    }
    // TODO: investigate why we need to genericize to model (from <T>)
    propertiesByModel[modelName][property] = meta;
}
/** lookup meta data for schema properties */
export function getModelProperty(model) {
    const className = model.constructor.name;
    const propsForModel = getProperties(model);
    return (prop) => {
        return propsForModel.find(value => {
            return value.property === prop;
        });
    };
}
/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
export function getProperties(model) {
    const modelName = model.constructor.name;
    const properties = hashToArray(propertiesByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...hashToArray(propertiesByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties;
}
//# sourceMappingURL=property-store.js.map