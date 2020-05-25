"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelsWithMeta = exports.getModelMeta = exports.addModelMeta = void 0;
const meta = {};
function addModelMeta(modelName, props) {
    meta[modelName] = props;
}
exports.addModelMeta = addModelMeta;
/**
 * Returns the META info for a given model, it will attempt to resolve
 * it locally first but if that is not available (as is the case with
 * self-reflexify relationships) then it will leverage the ModelMeta store
 * to get the meta information.
 *
 * @param modelKlass a model or record which exposes META property
 */
function getModelMeta(modelKlass) {
    const localMeta = modelKlass.META;
    const modelMeta = meta[modelKlass.modelName];
    return localMeta && localMeta.properties ? localMeta : modelMeta || {};
}
exports.getModelMeta = getModelMeta;
function modelsWithMeta() {
    return Object.keys(meta);
}
exports.modelsWithMeta = modelsWithMeta;
//# sourceMappingURL=ModelMeta.js.map