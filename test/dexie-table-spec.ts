import "./testing/fake-indexeddb";

import { carData, peopleData } from "./dexie-test-data";

import { Car } from "./testing/Car";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";
// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { DexieDb } from "@/index";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import indexedDB from "fake-indexeddb";

DexieDb.indexedDB(indexedDB, fdbKeyRange);

describe("Dexie Table API", () => {
  let db: DexieDb;
  beforeEach(async () => {
    db = new DexieDb("testing", Car, DeepPerson);
    if (!db.isOpen()) {
      await db.open();
    }
  });
  afterEach(() => {
    db.close();
  });

  it("bulkPut() puts records into the database; toArray() retrieves", async () => {
    const response = await db
      .table(Car)
      .bulkPut(carData)
      .catch((e) => {
        throw new Error(`Couldn't execute bulkAdd():  ${e.message}`);
      });

    const lastCar = carData.slice(-1).pop();
    expect(response).toBeString();
    expect(response).toBe(lastCar.id);

    const all = await db.table(Car).toArray();
    expect(all).toHaveLength(carData.length);
    expect(all.map((i) => i.id)).toEqual(
      expect.arrayContaining([carData[0].id])
    );
  });

  it("invalid data passed into bulkAdd() returns error", async () => {
    try {
      await db
        .table(Car)
        .bulkAdd(carData.concat({ foo: "dfadfasd", bar: "asdfsdf" } as any));
      throw new Error("invalid data should have thrown error");
    } catch (e) {
      expect(e.name).toBe("DataError");
    }
  });

  it.skip("bulkPut() of a model which has a composite key / dynamic path", async () => {
    const tbl = db.table(DeepPerson);
    await tbl.bulkPut(peopleData);
    const response = await tbl.toArray();
    expect(response).toHaveLength(peopleData.length);
    const ids = response.map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining([peopleData[0].id]));
    expect(ids).toEqual(expect.arrayContaining([peopleData[1].id]));
  });
});
