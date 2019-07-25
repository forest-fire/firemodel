"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
function createCompositeKeyString(rec) {
    const cKey = __1.createCompositeKey(rec);
    return rec.hasDynamicPath
        ? cKey.id +
            Object.keys(cKey)
                .filter(k => k !== "id")
                .map(k => `::${k}:${cKey[k]}`)
        : rec.id;
}
exports.createCompositeKeyString = createCompositeKeyString;
//# sourceMappingURL=createCompositeKeyString.js.map