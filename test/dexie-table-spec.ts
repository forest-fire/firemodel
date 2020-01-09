// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { expect } from "chai";
import { DexieDb } from "../src/dexie/DexieDb";
import { Car } from "./testing/Car";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";

import "./testing/fake-indexeddb";
import indexedDB from "fake-indexeddb";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
DexieDb.indexedDB(indexedDB, fdbKeyRange);

import { carData, peopleData } from "./dexie-test-data";

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

  it("bulkAdd() puts records into the database; toArray() retrieves", async () => {
    const response = await db
      .table(Car)
      .bulkAdd(carData)
      .catch(e => {
        throw new Error(`Couldn't execute bulkAdd():  ${e.message}`);
      });

    const lastCar = carData.slice(-1).pop();
    expect(response)
      .is.a("string")
      .and.equals(lastCar.id);

    const all = await db.table(Car).toArray();
    expect(all).to.have.lengthOf(carData.length);
    expect(all.map(i => i.id)).to.include(carData[0].id);
  });
});
