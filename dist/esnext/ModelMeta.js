const meta = {};
export function addModelMeta(modelName, props) {
    meta[modelName] = props;
}
/**
 * Returns the META info for a given model, it will attempt to resolve
 * it locally first but if that is not available (as is the case with
 * self-reflexify relationships) then it will leverage the ModelMeta store
 * to get the meta information.
 *
 * @param modelKlass a model or record which exposes META property
 */
export function getModelMeta(modelKlass) {
    const localMeta = modelKlass.META;
    const modelMeta = meta[modelKlass.modelName];
    return localMeta && localMeta.properties ? localMeta : modelMeta || {};
}
export function modelsWithMeta() {
    return Object.keys(meta);
}
//# sourceMappingURL=ModelMeta.js.map