import { RealTimeDB } from "abstracted-firebase";
import { Model, Record } from "..";
import { IDictionary } from "common-types";
import { IMockConfig } from "../Mock";
import { getModelMeta } from "../ModelMeta";
import mockValue from "./mockValue";

/** adds mock values for all the properties on a given model */
export default function mockProperties<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return async (instance: Record<T>): Promise<Record<T>> => {
    const meta = getModelMeta(instance);
    const props = meta.properties;

    const recProps: Partial<T> = {};
    props.map(prop => {
      const p = prop.property as keyof T;
      recProps[p] = mockValue<T>(db, prop);
    });
    const finalized: T = { ...(recProps as any), ...exceptions };

    // write to mock db
    instance = await instance.addAnother(finalized);

    return instance;
  };
}
