export function createCompositeKey(rec) {
    const model = rec.data;
    return Object.assign({ id: rec.id }, rec.dynamicPathComponents.reduce((prev, key) => (Object.assign({}, prev, { [key]: model[key] })), {}));
}
//# sourceMappingURL=createCompositeKey.js.map