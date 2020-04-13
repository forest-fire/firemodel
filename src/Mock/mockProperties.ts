import { RealTimeDB, getMockHelper } from "abstracted-firebase";
import { AbstractedDatabase } from "abstracted-database";

import { Model, Record } from "..";
import { IDictionary } from "common-types";
import { getModelMeta } from "../ModelMeta";
import mockValue from "./mockValue";
import { IMockConfig } from "./types";

/** adds mock values for all the properties on a given model */
export default function mockProperties<T extends Model>(
  db: AbstractedDatabase,
  config: IMockConfig = { relationshipBehavior: "ignore" },
  exceptions: IDictionary
) {
  return async (record: Record<T>): Promise<Record<T>> => {
    const meta = getModelMeta(record);
    const props = meta.properties;

    const recProps: Partial<T> = {};
    // set properties on the record with mocks
    const mh = await getMockHelper(db);

    for (const prop of props) {
      const p = prop.property as keyof T;
      recProps[p] = await mockValue<T>(db, prop, mh);
    }

    // use mocked values but allow exceptions to override
    const finalized: T = { ...(recProps as any), ...exceptions };

    // write to mock db and retain a reference to same model
    record = await Record.add(record.modelConstructor, finalized, {
      silent: true,
    });

    return record;
  };
}
