// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { expect } from "chai";
import { DexieDb } from "../src/dexie/DexieDb";
import "./testing/fake-indexeddb";
import { Car } from "./testing/Car";
import { DexieRecord } from "../src/dexie/DexieRecord";

import indexedDB from "fake-indexeddb";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import { db } from "firemock/dist/esnext/database";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";
import { wait } from "common-types";
DexieDb.indexedDB(indexedDB, fdbKeyRange);

describe("Dexie - Record API", () => {
  let d: DexieDb;
  beforeEach(async () => {
    d = new DexieDb("testing", Car, DeepPerson);
    if (!d.isOpen()) {
      await d.open();
    }
  });
  afterEach(() => {
    d.close();
  });

  it("Able to get the Record API from DexieDb", async () => {
    const car = d.record(Car);
    expect(car).to.be.instanceOf(DexieRecord);
    expect(car.add).to.be.a("function");
  });

  it("Able to call add() and then get() to show lifecycle", async () => {
    const car = d.record(Car);
    const addResponse = await car.add({
      id: "1234",
      model: "Fiesta",
      cost: 20000
    });
    expect(addResponse).to.be.an.instanceOf(Car);

    const result = await car.get("1234");
    expect(result.id).to.equal("1234");
    expect(result.model).to.equal("Fiesta");
    expect(result.lastUpdated).to.be.a("number");
    expect(result.createdAt).to.be.a("number");
    expect(result).to.be.instanceOf(Car);

    const person = d.record(DeepPerson);
    const addPerson = await person.add({
      name: { first: "Bob", last: "Marley" },
      group: "testing"
    });
    expect(addPerson).to.be.instanceOf(DeepPerson);
    expect(addPerson.id).to.be.a("string");
    expect(addPerson.group).to.equal("testing");
    expect(addPerson.lastUpdated).to.be.a("number");
    expect(addPerson.createdAt).to.be.a("number");
    const personResult = await person.get({
      id: addPerson.id,
      group: addPerson.group
    });
    expect(personResult).to.be.instanceOf(DeepPerson);
    expect(personResult.id).to.be.a("string");
    expect(personResult.group).to.equal("testing");
    expect(personResult.lastUpdated).to.be.a("number");
    expect(personResult.createdAt).to.be.a("number");
  });

  it("When calling add() without an id property, the id is auto-generated", async () => {
    const car = await d.record(Car).add({
      model: "Fiesta",
      cost: 22000
    });
    expect(car).to.be.instanceOf(Car);
    expect(car.id).to.be.a("string");
  });

  it("Calls to update() update the record correctly", async () => {
    const car = d.record(Car);
    await car.add({
      id: "4567",
      model: "Fiesta",
      cost: 20000
    });
    const initial = await car.get("4567");
    expect(initial.cost).to.equal(20000);
    await wait(10);
    await car.update("4567", { cost: 25000 });
    const final = await car.get("4567");
    expect(final.cost).to.equal(25000);
    expect(final.lastUpdated).to.be.greaterThan(
      initial.lastUpdated,
      `The updated record should have a more recent lastUpdated [ ${final.lastUpdated} ] timestamp than the initial [ ${initial.lastUpdated} ]`
    );
    expect(final.createdAt).to.equal(initial.createdAt);
  });

  it("remove() removes an added record; attempt to get afterward throws an error", async () => {
    const car = d.record(Car);
    await car.add({
      id: "666",
      model: "Fiesta",
      cost: 20000
    });
    await car.remove("666");
    try {
      const fail = await car.get("666");
      throw new Error(`The record 666 should have been removed from database!`);
    } catch (e) {
      expect(e.code === "add");
    }
  });
});
