var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
    var e_1, _a;
    const meta = getModelMeta(rec).property(property);
    const fks = rec.get(property);
    try {
        for (var _b = __asyncValues(Object.keys(fks)), _c; _c = await _b.next(), !_c.done;) {
            const key = _c.value;
            const fk = fks[key];
            if (fk !== true) {
                const fkRecord = await Record.add(meta.fkConstructor(), fk, {
                    setDeepRelationships: true
                });
                await rec.addToRelationship(property, fkRecord.compositeKeyRef);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
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