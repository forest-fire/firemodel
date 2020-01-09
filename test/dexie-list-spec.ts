// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { expect } from "chai";
import { DexieDb, DexieList } from "../src/index";
import { Car } from "./testing/Car";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";

import indexedDB from "fake-indexeddb";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import { carData, peopleData } from "./dexie-test-data";
DexieDb.indexedDB(indexedDB, fdbKeyRange);

describe.only("Dexie List API", () => {
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

  it("list.all() gets all records", async () => {
    await db.table(Car).bulkAdd(carData);
    const results = await db.list(Car).all();
    expect(results).to.have.lengthOf(carData.length);
    expect(results[0]).to.be.instanceOf(Car);
    expect(results.map(i => i.id)).to.include(carData[0].id);
  });

  it("list.all() with limit option reduces result size", async () => {
    await db.table(Car).bulkPut(carData);
    const results = await db.list(Car).all({ limit: 2 });
    expect(results).to.have.lengthOf(2);
    expect(results[0]).to.be.instanceOf(Car);
  });

  it.only("list.all() gets all records for composite-key/dynamic path model", async () => {
    await db.table(DeepPerson).bulkPut(peopleData);
    const results = await db.list(DeepPerson).all();
    expect(results).to.have.lengthOf(peopleData.length);
    expect(results[0]).to.be.instanceOf(DeepPerson);
    expect(results.map(i => i.id)).to.include(peopleData[0].id);
  });
});
