"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createCompositeKey(rec) {
    const model = rec.data;
    return Object.assign({ id: rec.id }, rec.dynamicPathComponents.reduce((prev, key) => (Object.assign({}, prev, { [key]: model[key] })), {}));
}
exports.createCompositeKey = createCompositeKey;
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
function createCompositeKeyString(rec) {
    const cKey = createCompositeKey(rec);
    return rec.hasDynamicPath
        ? cKey.id +
            Object.keys(cKey)
                .filter(k => k !== "id")
                .map(k => `::${k}:${cKey[k]}`)
        : rec.id;
}
exports.createCompositeKeyString = createCompositeKeyString;
//# sourceMappingURL=CompositeKey.js.map