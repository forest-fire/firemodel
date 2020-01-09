// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { expect } from "chai";
import { DexieDb, DexieList } from "../src/index";
import { Car } from "./testing/Car";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";

import indexedDB from "fake-indexeddb";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
DexieDb.indexedDB(indexedDB, fdbKeyRange);

describe("Dexie List API", () => {
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

  it("DexieDb.list hands off to DexieList instance", async () => {
    const dl = db.list(Car);
    expect(dl).to.be.instanceOf(DexieList);
    expect(dl.all).to.be.a("function");
  });

  it("list.all() gets all records when there sre records to be gotten", async () => {});
});
