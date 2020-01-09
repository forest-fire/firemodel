// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { expect } from "chai";
import { DexieDb } from "../src/dexie/DexieDb";
import { Car } from "./testing/Car";
import { Person } from "./testing/Person";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";

import "./testing/fake-indexeddb";
import indexedDB from "fake-indexeddb";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";

DexieDb.indexedDB(indexedDB, fdbKeyRange);

const cars = [
  {
    id: "123",
    model: "Volt",
    cost: 23000,
    modelYear: 2018,
    lastUpdated: 231231,
    createAt: 8980
  },
  {
    id: "456",
    model: "350e",
    cost: 46000,
    modelYear: 2016,
    lastUpdated: 231232,
    createAt: 8981
  },
  {
    id: "789",
    model: "A3",
    cost: 50000,
    modelYear: 2019,
    lastUpdated: 231233,
    createAt: 8982
  }
];

describe("DexieModel => ", () => {
  it("DexieModel can be instantiated with single Model", async () => {
    const d = new DexieDb("testing", Car);
    expect(d).to.be.instanceOf(DexieDb);
    expect(d.dbName).to.equal("testing");
  });

  it("DexieModel can be instantiated with multiple Models", async () => {
    const d = new DexieDb("testing", Car, Person);
    expect(d).to.be.instanceOf(DexieDb);
    expect(d.dbName).to.equal("testing");
    expect(d.modelNames).to.include("car");
    expect(d.modelNames).to.include("person");
  });

  it("meta information lookup works with singular and plural model name", async () => {
    const d = new DexieDb("testing", Car);
    expect(d.meta("car")).to.be.an("object");
    expect(d.meta("car").allProperties).to.be.an("array");
    expect(d.meta("cars")).to.be.an("object");
    expect(d.meta("cars").allProperties).to.be.an("array");
  });

  it("Dexie model definition works for static pathed model with non-unique index", async () => {
    const d = new DexieDb("testing", Car);
    expect(d.models.cars).to.be.a("string");
    expect(d.models.cars).to.include("&id");
    expect(d.models.cars).to.include("modelYear");
    expect(d.models.cars).to.not.include("&modelYear");
    expect(d.models.cars).to.include("&lastUpdated");
    expect(d.models.cars).to.include("&createdAt");
  });

  it("Dexie model definition works for dynamically pathed model", async () => {
    const d = new DexieDb("testing", DeeperPerson);
    expect(d.models.deeperPeople).to.be.a("string");
    expect(d.models.deeperPeople).to.include("[id+group+subGroup]");
    expect(d.models.deeperPeople).to.not.include("&id");
    expect(d.models.deeperPeople).to.include("&lastUpdated");
    expect(d.models.deeperPeople).to.include("&createdAt");
  });

  it("calling addPriorVersion() once increments the version", async () => {
    const d = new DexieDb("testing", Car);
    expect(d.version).to.equal(1);
    const fluent = d.addPriorVersion({ models: { cars: "&id" } });
    expect(d.version).to.equal(2);
    expect(fluent).to.be.instanceOf(DexieDb);
  });

  it("table() method returns a Dexie.Table class", async () => {
    const d = new DexieDb("testing", Car);
    const t = d.table(Car);
    expect(t).to.be.an("object");
    expect(t.add).to.be.a("function");
    expect(t.bulkAdd).to.be.a("function");
    expect(t.bulkPut).to.be.a("function");
  });

  it("table() gets back valid schema properties", async () => {
    const d = new DexieDb("testing", Car);
    const t = d.table(Car);
    expect(t.schema.name).to.equal("cars");
    expect(t.schema.mappedClass).to.be.a("function");
    expect(t.schema.primKey.name).to.equal("id");
  });

  it("table.schema is good for both dynamic and static models", async () => {
    const d = new DexieDb("testing", Car, DeepPerson);
    const fancyCars = d.table(Car);
    const people = d.table(DeepPerson);

    expect(fancyCars.schema.primKey.name).to.equal("id");
    expect(fancyCars.schema.primKey.keyPath).to.equal("id");

    let uniqueIndexes = fancyCars.schema.indexes
      .filter(i => i.unique)
      .map(i => i.name);
    let nonUniqueIndexes = fancyCars.schema.indexes
      .filter(i => !i.unique)
      .map(i => i.name);

    expect(uniqueIndexes)
      .and.to.include("lastUpdated")
      .and.to.include("createdAt");
    expect(nonUniqueIndexes).to.include("modelYear");

    expect(people.schema.primKey.name).to.equal("[id+group]");
    expect(people.schema.primKey.keyPath)
      .to.be.an("array")
      .and.include("id")
      .and.include("group");

    uniqueIndexes = people.schema.indexes
      .filter(i => i.unique)
      .map(i => i.name);
    nonUniqueIndexes = people.schema.indexes
      .filter(i => !i.unique)
      .map(i => i.name);

    expect(uniqueIndexes)
      .to.include("lastUpdated")
      .and.to.include("createdAt");

    expect(nonUniqueIndexes).to.have.lengthOf(0);
  });

  it("table() allows for bulkAdd() then get()", async () => {
    const db = new DexieDb("foobar", Car);
    if (db.isOpen()) {
      db.close();
    }
    await db.open().catch(e => {
      console.log(e);
    });

    const t = db.table(Car);
    await t.bulkAdd(cars).catch(e => {
      throw new Error(e);
    });
    const car: Car = await t.get("123").catch(e => {
      throw new Error(e);
    });

    expect(car).to.be.an.instanceOf(Car);
    const expected = cars.find(i => i.id === "123");
    expect(car.modelYear).to.equal(expected.modelYear);
  });
});
