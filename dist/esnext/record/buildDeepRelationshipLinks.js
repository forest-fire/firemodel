import { Record } from "..";
import { getModelMeta } from "../ModelMeta";
/**
 * When creating a new record it is sometimes desirable to pass in
 * the "payload" of FK's instead of just the FK. This function facilitates
 * that.
 */
export async function buildDeepRelationshipLinks(rec, property) {
    const meta = getModelMeta(rec).property(property);
    return meta.relType === "hasMany"
        ? processHasMany(rec, property)
        : processBelongsTo(rec, property);
}
async function processHasMany(rec, property) {
    const meta = getModelMeta(rec).property(property);
    const fks = rec.get(property);
    const promises = [];
    for (const key of Object.keys(fks)) {
        const fk = fks[key];
        if (fk !== true) {
            const fkRecord = await Record.add(meta.fkConstructor(), fk, {
                setDeepRelationships: true
            });
            await rec.addToRelationship(property, fkRecord.compositeKeyRef);
        }
    }
    // strip out object FK's
    const newFks = Object.keys(rec.get(property)).reduce((foreignKeys, curr) => {
        const fk = fks[curr];
        if (fk !== true) {
            delete foreignKeys[curr];
        }
        return foreignKeys;
    }, {});
    // TODO: maybe there's a better way than writing private property?
    // ambition is to remove the bullshit FKs objects; this record will
    // not have been saved yet so we're just getting it back to a good
    // state before it's saved.
    rec._data[property] = newFks;
    return;
}
async function processBelongsTo(rec, property) {
    const fk = rec.get(property);
    const meta = getModelMeta(rec).property(property);
    if (fk && typeof fk === "object") {
        const fkRecord = Record.add(meta.fkConstructor(), fk, {
            setDeepRelationships: true
        });
    }
}
//# sourceMappingURL=buildDeepRelationshipLinks.js.map