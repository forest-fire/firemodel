"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
async function processHasMany(record, rel, config, db) {
    const fkMockMeta = (await __1.Mock(rel.fkConstructor(), db).generate(1)).pop();
    const prop = rel.property;
    await record.addToRelationship(prop, fkMockMeta.compositeKey);
    if (config.relationshipBehavior === "link") {
        await db.remove(fkMockMeta.dbPath);
        return;
    }
    return fkMockMeta;
}
exports.processHasMany = processHasMany;
//# sourceMappingURL=processHasMany.js.map