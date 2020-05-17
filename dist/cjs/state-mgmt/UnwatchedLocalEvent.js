"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnwatchedLocalEvent = void 0;
function UnwatchedLocalEvent(rec, event) {
    const meta = {
        dynamicPathProperties: rec.dynamicPathComponents,
        compositeKey: rec.compositeKey,
        modelConstructor: rec.modelConstructor,
        modelName: rec.modelName,
        pluralName: rec.pluralName,
        localModelName: rec.META.localModelName,
        localPath: rec.localPath,
        localPostfix: rec.META.localPostfix
    };
    return Object.assign(Object.assign(Object.assign({}, event), meta), { dbPath: rec.dbPath, watcherSource: "unknown" });
}
exports.UnwatchedLocalEvent = UnwatchedLocalEvent;
//# sourceMappingURL=UnwatchedLocalEvent.js.map