import { createCompositeKey } from "..";
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
//# sourceMappingURL=createCompositeKeyString.js.map