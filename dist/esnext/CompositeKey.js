export function createCompositeKey(rec) {
    const model = rec.data;
    return Object.assign({ id: rec.id }, rec.dynamicPathComponents.reduce((prev, key) => (Object.assign({}, prev, { [key]: model[key] })), {}));
}
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export function createCompositeKeyString(rec) {
    const cKey = createCompositeKey(rec);
    return rec.hasDynamicPath
        ? cKey.id +
            Object.keys(cKey)
                .filter(k => k !== "id")
                .map(k => `::${k}:${cKey[k]}`)
        : rec.id;
}
//# sourceMappingURL=CompositeKey.js.map