// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { DexieDb } from "../src/dexie/DexieDb";
import "./testing/fake-indexeddb";
import { Car } from "./testing/Car";
import { DexieRecord } from "../src/dexie/DexieRecord";

import indexedDB from "fake-indexeddb";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";
import { wait } from "common-types";
import { fbKey } from "../src";
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
    expect(car).toBeInstanceOf(DexieRecord);
    expect(car.add).toBeInstanceOf("function");
  });

  it("Able to call add() and then get() to show lifecycle", async () => {
    const car = d.record(Car);
    const addResponse = await car.add({
      id: fbKey(),
      model: "Fiesta",
      cost: 20000
    });
    expect(addResponse).toBeInstanceOf(Car);

    const result = await car.get(addResponse.id);
    expect(result.id).toBe(addResponse.id);
    expect(result.model).toBe("Fiesta");
    expect(result.lastUpdated).toBeInstanceOf("number");
    expect(result.createdAt).toBeInstanceOf("number");
    expect(result).toBeInstanceOf(Car);

    const person = d.record(DeepPerson);
    const addPerson = await person.add({
      name: { first: "Bob", last: "Marley" },
      group: "testing"
    });
    expect(addPerson).toBeInstanceOf(DeepPerson);
    expect(addPerson.id).toBeInstanceOf("string");
    expect(addPerson.group).toBe("testing");
    expect(addPerson.lastUpdated).toBeInstanceOf("number");
    expect(addPerson.createdAt).toBeInstanceOf("number");
    const personResult = await person.get({
      id: addPerson.id,
      group: addPerson.group
    });
    expect(personResult).toBeInstanceOf(DeepPerson);
    expect(personResult.id).toBeInstanceOf("string");
    expect(personResult.group).toBe("testing");
    expect(personResult.lastUpdated).toBeInstanceOf("number");
    expect(personResult.createdAt).toBeInstanceOf("number");
  });

  it(
    "When calling add() without an id property, the id is auto-generated",
    async () => {
      const car = await d.record(Car).add({
        model: "Fiesta",
        cost: 22000
      });
      expect(car).toBeInstanceOf(Car);
      expect(car.id).toBeInstanceOf("string");
    }
  );

  it("Calls to update() update the record correctly", async () => {
    const car = d.record(Car);
    await car.add({
      id: "4567",
      model: "Fiesta",
      cost: 20000
    });
    const initial = await car.get("4567");
    expect(initial.cost).toBe(20000);
    await wait(10);
    await car.update("4567", { cost: 25000 });
    const final = await car.get("4567");
    expect(final.cost).toBe(25000);
    expect(final.lastUpdated).toBeGreaterThan(initial.lastUpdated);
    expect(final.createdAt).toBe(initial.createdAt);
  });

  it(
    "remove() removes an added record; attempt to get afterward throws an error",
    async () => {
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
    }
  );
});
