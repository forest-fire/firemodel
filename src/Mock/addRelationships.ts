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
  return async (record: Record<T>): Promise<IMockResponse> => {
    const relns = record.META.relationships;
    // const promises: Array<Promise<IMockResponse>> = [];

    if (config.relationshipBehavior !== "ignore") {
      const p = new Parallel<IMockResponse>("Adding Relationships to Mock");
      for (const rel of relns) {
        if (
          !config.cardinality ||
          Object.keys(config.cardinality).includes(rel.property)
        ) {
          if (rel.relType === "hasOne") {
            p.add(
              `hasOne-for-${record.modelName}`,
              processHasOne<T>(record, rel, config, db)
            );
            // promises.push(processHasOne<T>(record, rel, config, db));
          } else {
            // p.add(
            //   `hasMany-for-${record.modelName}`,
            //   processHasMany<T>(record, rel, config, db)
            // );
          }
        }
      }
      const results = await p.isDoneAsArray();
      // const results = await Promise.all(promises);
      console.log(results);
    }
    return {
      id: record.id,
      compositeKey: record.compositeKey,
      modelName: record.modelName,
      pluralName: record.pluralName,
      dbPath: record.dbPath,
      localPath: record.localPath
    };
  };
}
