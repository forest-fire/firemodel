"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * expands a locally originated event into a full featured
 * dispatch event with desired META from the model
 */
function createWatchEvent(type, record, event) {
    const payload = Object.assign({ type, key: record.id, modelName: record.modelName, pluralName: record.pluralName, modelConstructor: record.modelConstructor, dynamicPathProperties: record.dynamicPathComponents, compositeKey: record.compositeKey, dbPath: record.dbPath, localPath: record.localPath }, event);
    return payload;
}
exports.createWatchEvent = createWatchEvent;
//# sourceMappingURL=createWatchEvent.js.map