import { IMockRelationshipConfig, IModel } from "@/types";

import { IAbstractedDatabase } from "universal-fire";
import { IDictionary } from "common-types";
import { Record } from "@/core";
import { getMockHelper } from "firemock";
import { getModelMeta } from "@/util";
import { mockValue } from "./index";

/** adds mock values for all the properties on a given model */
export function mockProperties<T extends IModel>(
  db: IAbstractedDatabase,
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
