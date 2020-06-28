import "./testing/fake-indexeddb";

import { DexieDb, DexieList } from "@/index";
import { carData, peopleData } from "./dexie-test-data";

import { Car } from "./testing/Car";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import indexedDB from "fake-indexeddb";

DexieDb.indexedDB(indexedDB, fdbKeyRange);

// TODO: this test passes when run alone but somehow fails when run
// along with the OTHER dexie tests!
describe("Dexie List API", () => {
  let db: DexieDb;
  beforeEach(async () => {
    db = new DexieDb("testing", Car, DeepPerson);
    if (!db.isOpen()) {
      await db.open();
    }
  });
  afterEach(async () => {
    db.close();
  });

  it("DexieDb.list hands off to DexieList instance", async () => {
    const dl = db.list(Car);
    expect(dl).toBeInstanceOf(DexieList);
    expect(dl.all).toBeInstanceOf(Function);
  });

  it("list.all() gets all records", async () => {
    await db.table(Car).bulkPut(carData);
    const results = await db.list(Car).all();
    expect(results).toHaveLength(carData.length);
    expect(results[0]).toBeInstanceOf(Car);
    expect(results.map((i) => i.id)).toEqual(
      expect.arrayContaining([carData[0].id])
    );
  });

  it("list.all() with limit option reduces result size", async () => {
    await db.table(Car).bulkPut(carData);
    const results = await db.list(Car).all({ limit: 2 });
    expect(results).toHaveLength(2);
    expect(results[0]).toBeInstanceOf(Car);
  });

  it("list.all() gets all records for composite-key/dynamic path model", async () => {
    await db.table(DeepPerson).bulkPut(peopleData);
    const results = await db.list(DeepPerson).all();
    expect(results).toHaveLength(peopleData.length);
    expect(results[0]).toBeInstanceOf(DeepPerson);
    expect(results.map((i) => i.id)).toEqual(
      expect.arrayContaining([peopleData[0].id])
    );
  });

  it("list.where() reduces resultset appropriately", async () => {
    await db.table(Car).bulkPut(carData);
    let cars = await db.list(Car).where("modelYear", [">", 2017]);
    const years = cars.map((i) => i.modelYear);
    years.forEach((yr) => expect(yr).toBeGreaterThan(2017));

    cars = await db.list(Car).where("modelYear", 2019);
    const y2019 = cars.map((i) => i.modelYear);
    y2019.forEach((yr) => expect(yr).toBe(2019));

    const peeps = await db.list(DeepPerson).where("group", "fictional");
    expect(peeps).toHaveLength(
      peopleData.filter((i) => i.group === "fictional").length
    );
    peeps.forEach((peep) => expect(peep.group).toBe("fictional"));
  });

  it("list.since() filters records based on lastUpdated", async () => {
    await db.table(Car).bulkPut(carData);
    const results = await db.list(Car).since(carData[1].lastUpdated);
    expect(results).toHaveLength(1);
    expect(results[0].lastUpdated).toBeGreaterThan(carData[1].lastUpdated);
  });

  it("list.recent() filters records based on lastUpdated", async () => {
    await db.table(Car).bulkPut(carData);
    const cars = await db.list(Car).recent(1);
    expect(cars[0].lastUpdated).toBe(
      Math.max(...carData.map((i) => i.lastUpdated))
    );
  });

  it("list.first() and list.last() filters records based on createdAt", async () => {
    await db.table(Car).bulkPut(carData);
    const first = await db.list(Car).first(2);
    const last = await db.list(Car).last(2);
    const sortedCars = carData.sort((a, b) =>
      a.createdAt > b.createdAt ? 1 : -1
    );

    expect(first[0].id).toBe(sortedCars[0].id);
    expect(first[1].id).toBe(sortedCars[1].id);

    expect(last[0].id).toBe(sortedCars.slice(-1)[0].id);
    expect(last[1].id).toBe(sortedCars.slice(-2)[0].id);
  });
});
