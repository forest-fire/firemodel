import "reflect-metadata";
import { propertyReflector } from "./reflector";
import { hashToArray } from "typed-conversions";
/** DB Indexes accumlated by index decorators */
export const indexesForModel = {};
/**
 * Gets all the db indexes for a given model
 */
export function getDbIndexes(modelKlass) {
    const modelName = modelKlass.constructor.name;
    return modelName === "Model"
        ? hashToArray(indexesForModel[modelName])
        : (hashToArray(indexesForModel[modelName]) || []).concat(hashToArray(indexesForModel.Model));
}
export const index = propertyReflector({
    isIndex: true,
    isUniqueIndex: false
}, indexesForModel);
export const uniqueIndex = propertyReflector({
    isIndex: true,
    isUniqueIndex: true
}, indexesForModel);
//# sourceMappingURL=indexing.js.map