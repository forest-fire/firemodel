import { getMockHelper } from "firemock";

import { Model, Record } from "..";
import { IDictionary } from "common-types";
import { getModelMeta } from "../ModelMeta";
import mockValue from "./mockValue";
import { IMockRelationshipConfig } from "./types";
// import { IAbstractedDatabase } from "universal-fire";
import { AbstractedDatabase } from "@forest-fire/abstracted-database";

/** adds mock values for all the properties on a given model */
export default function mockProperties<T extends Model>(
  db: AbstractedDatabase,
  config: IMockRelationshipConfig = { relationshipBehavior: "ignore" },
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
