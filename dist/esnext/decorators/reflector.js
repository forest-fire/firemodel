import get from "get-value";
import set from "set-value";
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
    console.log(key, Reflect.getMetadata(key, modelKlass));
    const meta = Object.assign({}, (Reflect.getMetadata(key, modelKlass) || {}), { type: reflect.name }, context, { property: key });
    Reflect.defineMetadata(key, meta, modelKlass);
    if (modelRollup) {
        const modelAndProp = modelName + "." + key;
        set(modelRollup, modelAndProp, Object.assign({}, get(modelRollup, modelAndProp), meta));
    }
};
//# sourceMappingURL=reflector.js.map