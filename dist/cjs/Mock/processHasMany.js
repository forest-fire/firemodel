import { Mock, } from "../index";
export async function processHasMany(record, rel, config, db) {
    // by creating a mock we are giving any dynamic path segments
    // an opportunity to be mocked (this is best practice)
    const fkMockMeta = (await Mock(rel.fkConstructor(), db).generate(1)).pop();
    const prop = rel.property;
    await record.addToRelationship(prop, fkMockMeta.compositeKey);
    if (config.relationshipBehavior === "link") {
        await db.remove(fkMockMeta.dbPath);
        return;
    }
    return fkMockMeta;
}
//# sourceMappingURL=processHasMany.js.map