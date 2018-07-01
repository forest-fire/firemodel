import { set, get } from "lodash";
function push(target, path, value) {
    set(target, path, value);
}
export const propertyReflector = (context = {}, 
/** if you want this to be rollup up as an dictionary by prop; to be exposed in the model (or otherwise) */
modelRollup) => (modelKlass, key) => {
    const modelName = modelKlass.constructor.name;
    const reflect = Reflect.getMetadata("design:type", modelKlass, key) || {};
    const meta = Object.assign({}, context, { type: reflect.name }, Reflect.getMetadata(key, modelKlass), { property: key });
    Reflect.defineMetadata(key, meta, modelKlass);
    if (modelRollup) {
        const modelAndProp = modelName + "." + key;
        set(modelRollup, modelAndProp, Object.assign({}, get(modelRollup, modelAndProp), meta));
    }
};
//# sourceMappingURL=reflector.js.map