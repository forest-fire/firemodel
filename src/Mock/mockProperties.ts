import { RealTimeDB } from "abstracted-firebase";
import { Model, Record } from "..";
import { IDictionary } from "common-types";
import { getModelMeta } from "../ModelMeta";
import mockValue from "./mockValue";
import { IMockConfig } from "./types";

/** adds mock values for all the properties on a given model */
export default function mockProperties<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig = { relationshipBehavior: "ignore" },
  exceptions: IDictionary
) {
  return async (record: Record<T>): Promise<Record<T>> => {
    const meta = getModelMeta(record);
    const props = meta.properties;

    const recProps: Partial<T> = {};
    props.map(prop => {
      const p = prop.property as keyof T;
      recProps[p] = mockValue<T>(db, prop);
    });

    const finalized: T = { ...(recProps as any), ...exceptions };

    // write to mock db and retain a reference to same model
    record = await record.addAnother(finalized);
    if (record.modelName === "hobby") {
      console.log(record.id);
    }
    return record;
  };
}
