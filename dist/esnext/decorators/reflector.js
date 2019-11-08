import get from "get-value";
import set from "set-value";
import { lowercase } from "../util";
function push(target, path, value) {
    set(target, path, value);
}
/**
 * Adds meta data to a given "property" on a model. In this
 * case we mean property to be either a strict property or
 * a relationship.
 *
 * @param context The meta information as a dictionary/hash
 * @param modelRollup a collection object which maintains
 * a dictionary of properties
 */
export const propertyReflector = (context = {}, 
/**
 * if you want this to be rollup up as an dictionary by prop;
 * to be exposed in the model (or otherwise)
 */
modelRollup) => (modelKlass, key) => {
    const modelName = modelKlass.constructor.name;
    const reflect = Reflect.getMetadata("design:type", modelKlass, key) || {};
    const meta = Object.assign({}, (Reflect.getMetadata(key, modelKlass) || {}), { type: lowercase(reflect.name) }, context, { property: key });
    Reflect.defineMetadata(key, meta, modelKlass);
    if (modelRollup) {
        const modelAndProp = modelName + "." + key;
        set(modelRollup, modelAndProp, Object.assign({}, get(modelRollup, modelAndProp), meta));
    }
};
//# sourceMappingURL=reflector.js.map