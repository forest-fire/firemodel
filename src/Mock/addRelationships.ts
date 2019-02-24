import { RealTimeDB } from "abstracted-firebase";
import { IDictionary } from "common-types";
import { Model } from "../Model";
import { Record } from "../Record";
import { Parallel } from "wait-in-parallel";
import { getModelMeta } from "../ModelMeta";
import { fbKey } from "../index";
import { pathJoin } from "../path";
import { createCompositeKeyString } from "../Record/CompositeKey";
import { IMockConfig } from "./types";

export default function addRelationships<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return async (instance: Record<T>): Promise<Record<T>> => {
    // TODO: I believe all references to "getModelMeta" can be removed now
    // and replaced with just direct access to instance.META
    const meta = getModelMeta(instance);
    const relns = meta.relationships;
    const p = new Parallel();
    if (!relns || config.relationshipBehavior === "ignore") {
      return instance;
    }
    const follow = config.relationshipBehavior === "follow";
    relns.map(rel => {
      if (
        !config.cardinality ||
        Object.keys(config.cardinality).includes(rel.property)
      ) {
        if (rel.relType === "hasOne") {
          const id = fbKey();
          const prop: Extract<keyof T, string> = rel.property as any;
          p.add(
            `hasOne-${id}`,
            follow
              ? instance.setRelationship(prop, id)
              : db.set(
                  pathJoin(instance.dbPath, prop),
                  createCompositeKeyString(instance)
                )
          );
        } else {
          const cardinality = config.cardinality
            ? typeof config.cardinality[rel.property] === "number"
              ? config.cardinality[rel.property]
              : NumberBetween(config.cardinality[rel.property] as any)
            : 2;
          for (let i = 0; i < cardinality; i++) {
            const id = fbKey();
            const prop: Extract<keyof T, string> = rel.property as any;

            p.add(
              `hasMany-${id}`,
              follow
                ? instance.addToRelationship(prop, id)
                : db.set(
                    pathJoin(
                      instance.dbPath,
                      prop,
                      createCompositeKeyString(instance)
                    ),
                    true
                  )
            );
          }
        }
      }
    });
    try {
      await p.isDone();
    } catch (e) {
      console.log(JSON.stringify(e));
      throw e;
    }
    instance = await instance.reload();

    return instance;
  };
}

function NumberBetween(startEnd: [number, number]) {
  return (
    Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]
  );
}
