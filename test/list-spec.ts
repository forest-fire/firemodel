import "reflect-metadata";

import * as helpers from "./testing/helpers";

// tslint:disable:no-implicit-dependencies
import { IFmWatchEvent, List, Record } from "../src/index";
import { IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { Car } from "./testing/Car";
import Company from "./testing/dynamicPaths/Company";
import { FireModel } from "../src/FireModel";
import { FmEvents } from "../src/state-mgmt";
import { Mock } from "../src/Mock";
import { Person } from "./testing/Person";
import { SerializedQuery } from "universal-fire";

describe("List class: ", () => {
  let db: IRealTimeAdmin;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });
  it("can instantiate with new operator", () => {
    const list = new List<Person>(Person);
    expect(list).toBeInstanceOf(List);
    expect(list.length).toBe(0);
    expect(list.modelName).toBe("person");
    expect(list.pluralName).toBe("people");
    expect(list.dbPath).toBe(`${list.META.dbOffset}/people`);
  });

  it("can instantiate with create() method", () => {
    const list = List.create(Person, { db });
    expect(list).toBeInstanceOf(List);
    expect(list.length).toBe(0);
    expect(list.modelName).toBe("person");
    expect(list.pluralName).toBe("people");
    expect(list.dbPath).toBe(`${list.META.dbOffset}/people`);
  });

  it(
    "Static dbPath() provides appropriate database path for Models",
    async () => {
      const car = List.dbPath(Car);
      expect(car).toBe("car-offset/cars");

      const dynamic = List.dbPath(Company, { group: "123" });
      expect(dynamic).toBe("123/testing/companies");
    }
  );

  it("List can SET a dictionary of records", async () => {
    const list = await List.set(Person, {
      joe: {
        name: "Joe",
        age: 14,
      },
      roger: {
        age: 22,
        name: "Roger",
      },
    });

    expect(list).toHaveLength(2);
    expect(list.map((i) => i.name)).toEqual(expect.arrayContaining(["Joe"]));
    expect(list.map((i) => i.name)).toEqual(expect.arrayContaining(["Roger"]));
    expect(list.map((i) => i.age)).toEqual(expect.arrayContaining([14]));
    expect(list.map((i) => i.age)).toEqual(expect.arrayContaining([22]));
    expect(list.data[0].createdAt).toBeInstanceOf("number");
    expect(list.data[1].createdAt).toBeInstanceOf("number");
  });

  it("can instantiate with all() method", async () => {
    db.mock
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 25).generate();
    const list = await List.all(Person, { db });
    expect(list).toBeInstanceOf(List);
    expect(list.length).toBe(25);
    expect(list.modelName).toBe("person");
    expect(list.pluralName).toBe("people");
    expect(list.dbPath).toBe(`${list.META.dbOffset}/people`);
  });

  it("can instantiate with from() method", async () => {
    db.mock
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 25).generate();

    const q = SerializedQuery.create(db).limitToLast(5);
    const results = await List.fromQuery(Person, q, { db });
    expect(results.length).toBe(5);
  });

  it("can instantiate with a where() method", async () => {
    db.mock
      .addSchema("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
      }))
      .pathPrefix("authenticated");
    db.mock
      .queueSchema("person", 10)
      .queueSchema("person", 2, { age: 99 })
      .generate();

    const oldFolks = await List.where(Person, "age", 99);
    const youngFolks = await List.where(Person, "age", ["<", 90]);

    expect(oldFolks).toBeInstanceOf(List);
    expect(youngFolks).toBeInstanceOf(List);
    expect(oldFolks.length).toBe(2);
    expect(youngFolks.length).toBe(10);
  });

  it("can instantiate with first() and last() methods", async () => {
    db.mock
      .addSchema<Person>("person", (h) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 30).generate();
    const first = await List.first(Person, 5);
    const last = await List.last(Person, 5);
    const firstCreatedDate = first.data[0].createdAt;
    const lastCreatedDate = last.data[0].createdAt;

    expect(first).toHaveLength(5);
    expect(last).toHaveLength(5);
    expect(firstCreatedDate).toBeLessThan(lastCreatedDate);
  });

  it("can instantiate with recent(), and inactive() methods", async () => {
    db.mock
      .addSchema<Person>("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf(),
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 30).generate();
    const recent = await List.recent(Person, 6);
    const inactive = await List.inactive(Person, 4);
    const recentCreatedDate = recent.data[0].lastUpdated;
    const inactiveCreatedDate = inactive.data[0].lastUpdated;

    expect(recent).toHaveLength(6);
    expect(inactive).toHaveLength(4);
    expect(recentCreatedDate).toBeGreaterThan(inactiveCreatedDate);
  });

  it("can instantiate with since() returns correct results", async () => {
    const timestamp = new Date().getTime();
    db.mock
      .addSchema<Person>("person", (h: any) => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 49 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: timestamp,
      }))
      .pathPrefix("authenticated");
    db.mock
      .queueSchema("person", 30, { lastUpdated: timestamp - 5000 })
      .generate();
    db.mock
      .queueSchema("person", 8, { lastUpdated: timestamp + 1000 })
      .generate();

    const since = await List.since(Person, timestamp);

    expect(since).toHaveLength(8);
  });

  it(
    "an instantiated List can call get() with a valid ID and get a Record",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30).generate();
      const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
      const list = await List.all(Person);
      const record = list.findById(firstPersonId);
      expect(record).toBeInstanceOf("object");
      expect(record).toBeInstanceOf(Record);
      expect(record.data).toBeInstanceOf(Person);
      expect(record.data.name).toBeInstanceOf("string");
    }
  );

  it(
    "an instantiated List can call getData() with a valid ID and get a Model",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30).generate();
      const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
      const list = await List.all(Person);
      const person = list.getData(firstPersonId);
      expect(person).toBeInstanceOf("object");
      expect(person).toBeInstanceOf(Person);
      expect(person.name).toBeInstanceOf("string");
    }
  );

  it(
    "an instantiated List calling get() with an invalid ID throws an error",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30).generate();
      const list = await List.all(Person);
      try {
        const record = list.findById("not-there");
        throw new Error("Invalid ID should have thrown error");
      } catch (e) {
        expect(e.name).toBe("NotFound");
      }
    }
  );

  it(
    "an instantiated List calling get() with an invalid ID and default value returnes the default value",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30).generate();
      const list = await List.all(Person);
      try {
        const record = list.findById("not-there", null);
        expect(record).toBe(null);
      } catch (e) {
        throw new Error(
          "When default value is provided no error should be raised"
        );
      }
    }
  );
  it(
    "an instantiated List calling getData() with an invalid ID and default value returnes the default value",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30).generate();
      const list = await List.all(Person);
      try {
        const record = list.getData("not-there", null);
        expect(record).toBe(null);
      } catch (e) {
        throw new Error(
          "When default value is provided no error should be raised"
        );
      }
    }
  );

  it(
    "an instantiated List calling findData() with a valid ID returnes the default value",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30).generate();
      const list = await List.all(Person);
      try {
        const record = list.getData("not-there", null);
        expect(record).toBe(null);
      } catch (e) {
        throw new Error(
          "When default value is provided no error should be raised"
        );
      }
    }
  );

  it(
    "using findWhere() returns a record when property/value is found",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30);
      db.mock.queueSchema("person", 1, { name: "foobar" });
      db.mock.queueSchema("person", 3, { age: 12 }).generate();
      const list = await List.all(Person);
      const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
      expect(list.findWhere("id", firstPersonId)).toBeInstanceOf("object");
      expect(list.findWhere("name", "foobar")).toBeInstanceOf("object");
      expect(list.findWhere("age", 12)).toBeInstanceOf("object");
    }
  );

  it(
    "using findWhere() returns appropriately when record not found",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 3, { age: 12 }).generate();
      const list = await List.all(Person);
      try {
        expect(list.findWhere("name", "foobar")).toBeInstanceOf("object");
      } catch (e) {
        expect(e.name).toBe("NotFound");
      }
      expect(list.findWhere("name", "foobar", "default")).toBe("default");
    }
  );

  it(
    "using find() returns a record when passed in filter finds record",
    async () => {
      db.mock
        .addSchema<Person>("person", (h: any) => () => ({
          name: h.faker.name.firstName(),
          age: h.faker.random.number({ min: 1, max: 50 }),
          createdAt: h.faker.date.past().valueOf(),
          lastUpdated: h.faker.date.recent().valueOf(),
        }))
        .pathPrefix("authenticated");
      db.mock.queueSchema("person", 30);
      db.mock.queueSchema("person", 1, { name: "foobar" });
      db.mock.queueSchema("person", 3, { age: 12 }).generate();

      const people = await List.all(Person);

      people.map((person) => {
        expect(person.id).toBeInstanceOf("string");
        expect(person.age).toBeInstanceOf("number");
        const foundById = people.findWhere("id", person.id);
        const foundByAge = people.findWhere("age", person.age);
      });
    }
  );

  it(
    "using remove() able to change local state, db state, and state mgmt",
    async () => {
      await Mock(Person, db).generate(10);
      const events: Array<IFmWatchEvent<Person>> = [];
      Record.dispatch = async (evt: IFmWatchEvent<Person>) => events.push(evt);
      const peeps = await List.all(Person);
      const id = peeps.data[1].id;
      const removed = await peeps.removeById(id);
      expect(peeps).toHaveLength(9);
      const eventTypes = new Set(events.map((e) => e.type));

      expect(eventTypes).toEqual(expect.arrayContaining([FmEvents.RECORD_REMOVED_CONFIRMATION]));
      expect(eventTypes).toEqual(expect.arrayContaining([FmEvents.RECORD_REMOVED_LOCALLY]));

      const peeps2 = await List.all(Person);
      expect(peeps2).toHaveLength(9);
      const ids = new Set(peeps2.map((p) => p.id));
      expect(ids.has(id)).toBe(false);
    }
  );

  it("using add() changes local state, db state, and state mgmt", async () => {
    await Mock(Person, db).generate(10);
    const events: Array<IFmWatchEvent<Person>> = [];
    Record.dispatch = async (evt: IFmWatchEvent<Person>) => events.push(evt);
    const peeps = await List.all(Person);
    expect(peeps).toHaveLength(10);
    const newRec = await peeps.add({
      name: "Christy Brinkley",
      age: 50,
    });
    expect(peeps).toHaveLength(11);
    const ids = new Set(peeps.map((p) => p.id));
    expect(ids.has(newRec.id)).toBe(true);

    const eventTypes = events.map((e) => e.type);
    expect(eventTypes).toEqual(expect.arrayContaining([FmEvents.RECORD_ADDED_CONFIRMATION]));
    expect(eventTypes).toEqual(expect.arrayContaining([FmEvents.RECORD_ADDED_LOCALLY]));
  });
});
