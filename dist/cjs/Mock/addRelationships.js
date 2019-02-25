"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wait_in_parallel_1 = require("wait-in-parallel");
const ModelMeta_1 = require("../ModelMeta");
const index_1 = require("../index");
function addRelationships(db, config, exceptions = {}) {
    return async (record) => {
        // TODO: I believe all references to "getModelMeta" can be removed now
        // and replaced with just direct access to instance.META
        const meta = ModelMeta_1.getModelMeta(record);
        const relns = meta.relationships;
        const p = new wait_in_parallel_1.Parallel("Adding Relationships");
        if (!relns || config.relationshipBehavior === "ignore") {
            return record;
        }
        const followRelationship = config.relationshipBehavior === "follow";
        console.log("relationships: ", relns.length);
        for (const rel of relns) {
            if (!config.cardinality ||
                Object.keys(config.cardinality).includes(rel.property)) {
                if (rel.relType === "hasOne") {
                    const fkMockMeta = (await index_1.Mock(rel.fkConstructor(), db).generate(1)).pop();
                    const prop = rel.property;
                    p.add(`hasOne-${fkMockMeta.id}-${record.modelName}-${prop}`, record.setRelationship(prop, fkMockMeta.compositeKey));
                    if (!followRelationship) {
                        p.add(`hasOne-remove-fk-${fkMockMeta.id}-${fkMockMeta.modelName}`, db.remove(fkMockMeta.dbPath.replace(fkMockMeta.id, "")));
                        const predecessors = fkMockMeta.dbPath
                            .replace(fkMockMeta.id, "")
                            .split("/")
                            .filter(i => i);
                        // p.add("cleaning-predecessors", cleanPredecessor(db, predecessors));
                    }
                }
                else {
                    const cardinality = config.cardinality
                        ? typeof config.cardinality[rel.property] === "number"
                            ? config.cardinality[rel.property]
                            : NumberBetween(config.cardinality[rel.property])
                        : 2;
                    // for (const i of Object.keys(test)) {
                    console.log(rel.property);
                    const fkMockMeta = (await index_1.Mock(rel.fkConstructor(), db).generate(1)).pop();
                    const prop = rel.property;
                    p.add(`hasMany-${fkMockMeta.compositeKey}`, record.addToRelationship(prop, fkMockMeta.compositeKey));
                    // }
                }
            }
        }
        await p.isDone();
        record = await record.reload();
        return record;
    };
}
exports.default = addRelationships;
function NumberBetween(startEnd) {
    return (Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]);
}
//# sourceMappingURL=addRelationships.js.map