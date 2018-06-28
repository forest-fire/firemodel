const meta = {};
export function addModelMeta(modelName, props) {
    meta[modelName] = props;
}
export function getModelMeta(modelName) {
    return meta[modelName] || {};
}
export function modelsWithMeta() {
    return Object.keys(meta);
}
//# sourceMappingURL=ModelMeta.js.map