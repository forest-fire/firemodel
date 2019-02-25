import { Parallel } from "wait-in-parallel";
import { processHasMany } from "./processHasMany";
import { processHasOne } from "./processHasOne";
export default function addRelationships(db, config, exceptions = {}) {
    return async (record) => {
        const relns = record.META.relationships;
        const relnResults = [];
        if (config.relationshipBehavior !== "ignore") {
            const p = new Parallel("Adding Relationships to Mock");
            for (const rel of relns) {
                if (!config.cardinality ||
                    Object.keys(config.cardinality).includes(rel.property)) {
                    if (rel.relType === "hasOne") {
                        const fkRec = await processHasOne(record, rel, config, db);
                        if (config.relationshipBehavior === "follow") {
                            relnResults.push(fkRec);
                        }
                    }
                    else {
                        const cardinality = config.cardinality
                            ? typeof config.cardinality[rel.property] === "number"
                                ? config.cardinality[rel.property]
                                : NumberBetween(config.cardinality[rel.property])
                            : 2;
                        for (const i of Array(cardinality)) {
                            const fkRec = await processHasMany(record, rel, config, db);
                            if (config.relationshipBehavior === "follow") {
                                relnResults.push(fkRec);
                            }
                        }
                    }
                }
            }
        }
        return [
            {
                id: record.id,
                compositeKey: record.compositeKey,
                modelName: record.modelName,
                pluralName: record.pluralName,
                dbPath: record.dbPath,
                localPath: record.localPath
            },
            ...relnResults
        ];
    };
}
function NumberBetween(startEnd) {
    return (Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]);
}
//# sourceMappingURL=addRelationships.js.map