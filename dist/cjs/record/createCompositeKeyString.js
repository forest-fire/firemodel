"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompositeRef = exports.createCompositeKeyRefFromRecord = void 0;
const __1 = require("..");
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
function createCompositeKeyRefFromRecord(rec) {
    const cKey = __1.createCompositeKey(rec);
    return rec.hasDynamicPath ? createCompositeRef(cKey) : rec.id;
}
exports.createCompositeKeyRefFromRecord = createCompositeKeyRefFromRecord;
/**
 * Given a hash/dictionary (with an `id` prop), will generate a "composite
 * reference" in string form.
 */
function createCompositeRef(cKey) {
    return Object.keys(cKey).length > 1
        ? cKey.id +
            Object.keys(cKey)
                .filter(k => k !== "id")
                .map(k => `::${k}:${cKey[k]}`)
        : cKey.id;
}
exports.createCompositeRef = createCompositeRef;
//# sourceMappingURL=createCompositeKeyString.js.map