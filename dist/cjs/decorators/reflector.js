"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function push(target, path, value) {
    lodash_1.set(target, path, value);
}
exports.propertyReflector = (context = {}, 
/** if you want this to be rollup up as an dictionary by prop; to be exposed in the model (or otherwise) */
modelRollup) => (modelKlass, key) => {
    const modelName = modelKlass.constructor.name;
    const reflect = Reflect.getMetadata("design:type", modelKlass, key) || {};
    const meta = Object.assign({}, context, { type: reflect.name }, Reflect.getMetadata(key, modelKlass), { property: key });
    Reflect.defineMetadata(key, meta, modelKlass);
    if (modelRollup) {
        const modelAndProp = modelName + "." + key;
        lodash_1.set(modelRollup, modelAndProp, Object.assign({}, lodash_1.get(modelRollup, modelAndProp), meta));
    }
};
//# sourceMappingURL=reflector.js.map