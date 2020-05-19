"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processHasMany = void 0;
const index_1 = require("../index");
async function processHasMany(record, rel, config, db) {
    // by creating a mock we are giving any dynamic path segments
    // an opportunity to be mocked (this is best practice)
    const fkMockMeta = (await index_1.Mock(rel.fkConstructor(), db).generate(1)).pop();
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