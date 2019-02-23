import { Model, Record } from "..";
import { RealTimeDB } from "abstracted-firebase";
import { IMockConfig, Mock } from "../Mock";
import { IDictionary } from "common-types";
import { Parallel } from "wait-in-parallel";
import { getModelMeta } from "../ModelMeta";

/** adds models to mock DB which were pointed to by original model's FKs */
export default function followRelationships<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return async (instance: Record<T>): Promise<Record<T>> => {
    const p = new Parallel();

    const relns = getModelMeta(instance).relationships;
    if (!relns || config.relationshipBehavior !== "follow") {
      return instance;
    }

    const hasMany = relns.filter(i => i.relType === "hasMany");
    const hasOne = relns.filter(i => i.relType === "hasOne");
    hasMany.map(r => {
      const fks = Object.keys(instance.get(r.property as any));
      fks.map(fk => {
        p.add(fk, Mock(r.fkConstructor(), db).generate(1, { id: fk }));
      });
    });
    hasOne.map(r => {
      const fk: any = instance.get(r.property as any);
      p.add(fk, Mock(r.fkConstructor(), db).generate(1, { id: fk }));
    });

    await p.isDone();
    return instance;
  };
}
