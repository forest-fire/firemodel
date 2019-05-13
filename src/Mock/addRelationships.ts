import { RealTimeDB } from "abstracted-firebase";
import { IDictionary } from "common-types";
import { Model } from "../Model";
import { Record } from "../Record";
import { Parallel } from "wait-in-parallel";
import { IMockConfig, IMockResponse } from "./types";
import { processHasMany } from "./processHasMany";
import { processHasOne } from "./processHasOne";

export default function addRelationships<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig,
  exceptions: IDictionary = {}
) {
  return async (record: Record<T>): Promise<Array<IMockResponse<T>>> => {
    const relns = record.META.relationships;
    const relnResults: Array<IMockResponse<T>> = [];

    if (config.relationshipBehavior !== "ignore") {
      const p = new Parallel<IMockResponse<T>>("Adding Relationships to Mock");
      for (const rel of relns) {
        if (
          !config.cardinality ||
          Object.keys(config.cardinality).includes(rel.property)
        ) {
          if (rel.relType === "hasOne") {
            const fkRec = await processHasOne<T>(record, rel, config, db);
            if (config.relationshipBehavior === "follow") {
              relnResults.push(fkRec);
            }
          } else {
            const cardinality = config.cardinality
              ? typeof config.cardinality[rel.property] === "number"
                ? config.cardinality[rel.property]
                : NumberBetween(config.cardinality[rel.property] as any)
              : 2;
            for (const i of Array(cardinality)) {
              const fkRec = await processHasMany<T>(record, rel, config, db);
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

function NumberBetween(startEnd: [number, number]) {
  return (
    Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]
  );
}
