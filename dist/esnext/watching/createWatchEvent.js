/**
 * expands a locally originated event into a full featured
 * dispatch event with desired META from the model
 */
export function createWatchEvent(type, record, event) {
    const payload = Object.assign({ type, key: record.id, modelName: record.modelName, pluralName: record.pluralName, modelConstructor: record.modelConstructor, dynamicPathProperties: record.dynamicPathComponents, compositeKey: record.compositeKey, dbPath: record.dbPath, localPath: record.localPath || "", localPostfix: record.META.localPostfix }, event);
    return payload;
}
//# sourceMappingURL=createWatchEvent.js.map