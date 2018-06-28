"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meta = {};
function addModelMeta(modelName, props) {
    meta[modelName] = props;
}
exports.addModelMeta = addModelMeta;
function getModelMeta(modelName) {
    return meta[modelName] || {};
}
exports.getModelMeta = getModelMeta;
function modelsWithMeta() {
    return Object.keys(meta);
}
exports.modelsWithMeta = modelsWithMeta;
//# sourceMappingURL=ModelMeta.js.map