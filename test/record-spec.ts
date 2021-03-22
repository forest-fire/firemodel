import "reflect-metadata";

import { IFmLocalEvent, IFmWatchEvent, List, Record } from "../src";
import { IAbstractedDatabase, IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { FireModel } from "@/index";
import { FmEvents } from "@/index";
import { Mock } from "@/index";
import { Person as Peeps } from "./testing/PersonAsPeeps";
import { Person } from "./testing/Person";

describe("Record > ", () => {
  let db: IAbstractedDatabase;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
    FireModel.dispatch = null;
  });

  it("can instantiate with new operator", async () => {
    const person = new Record(Person);
    expect(person.modelName).toBe("person");
  });

  it("Record's add() factory adds record to database", async () => {
    const r = await Record.add(Person, {
      name: "Bob Marley",
      age: 40,
    });
    expect(r).toBeInstanceOf(Record);
    expect(r.get("name")).toBe("Bob Marley");
    expect(r.id).toBeString();
    // test DB too
    const fromDb = await Record.get(Person, r.id);
    expect(fromDb).toBeInstanceOf(Record);
    expect(fromDb.get("name")).toBe("Bob Marley");
    expect(fromDb.id).toBeString();
  });

  it(`Record's static add() fires client events`, async () => {
    const events: Array<IFmLocalEvent<Person>> = [];
    Record.dispatch = async (payload: IFmLocalEvent<Person>) =>
      events.push(payload);
    const r = await Record.add(Person, {
      name: "Bob",
      age: 40,
    });
    expect(events).toHaveLength(2);
    const eventTypes = new Set(events.map((e) => e.type));
    expect(eventTypes.has(FmEvents.RECORD_ADDED_CONFIRMATION)).toBe(true);
    expect(eventTypes.has(FmEvents.RECORD_ADDED_LOCALLY)).toBe(true);
  });

  it("Record's load() populates state, does not add to db", async () => {
    const r = Record.createWith(Person, {
      name: "Bob",
      age: 40,
    });
    expect(r).toBeInstanceOf(Record);
    expect(r.get("name")).toBe("Bob");
    expect(r.id).toBeUndefined();
  });

  it("Once an ID is set it can not be reset", async () => {
    const r = await Record.add(Person, {
      name: "Bob",
      age: 40,
    });
    const id = r.id;
    try {
      r.id = "12345";
      throw new Error("Let ID be reset!");
    } catch (e) {
      expect(r.id).toBe(id);
      expect(e.name).toBe("firemodel/not-allowed");
      expect(e.code).toBe("not-allowed");
    }
  });

  it("using pushKey sets state locally immediately", async () => {
    db.set<Person>("/authenticated/people/1234", {
      name: "Bart Simpson",
      age: 10,
    });
    const bart = await Record.get(Person, "1234", { db });
    const k1 = await bart.pushKey("tags", "doh!");
    const k2 = await bart.pushKey("tags", "whazzup?");
    // local tests
    expect(bart.data.tags[k1]).toBe("doh!");
    expect(bart.data.tags[k2]).toBe("whazzup?");
    expect(Object.keys(bart.data.tags).length).toBe(2);

    // db tests
    const bartAgain = await Record.get(Person, "1234", { db });

    expect(bartAgain.data.tags[k1]).toBe("doh!");
    expect(bartAgain.data.tags[k2]).toBe("whazzup?");
  });

  it("using pushKey updates lastUpdated", async () => {
    const now = new Date().getTime();
    await db.set<Person>("/authenticated/people/1234", {
      name: "Bart Simpson",
      age: 10,
      lastUpdated: now,
      createdAt: now,
    });
    const bart = await Record.get(Person, "1234", { db });
    const backThen = bart.data.createdAt;

    expect(bart.data.lastUpdated).toBe(backThen);
    const pk = await bart.pushKey("tags", "doh!");
    const result = await Record.get(Person, "1234", { db });

    expect(result.data.tags[pk]).toBe("doh!");
    expect(result.data.lastUpdated).toBeGreaterThan(backThen);
    expect(result.data.createdAt).toBe(backThen);
  });

  it("create Record with static get() factory", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      tags: { 123: "cartoon" },
      company: "disney",
    });
    const roger = await Record.get(Person, "8888");
    expect(roger).toBeInstanceOf(Record);
    expect(roger.data).toBeInstanceOf(Person);
    expect(roger.get("name")).toBe("Roger Rabbit");
    expect(roger.get("age")).toBe(3);
    expect(roger.get("company")).toBe("disney");
    expect(roger.data.tags["123"]).toBe("cartoon");
  });

  it("using update() allows non-destructive updates on object type when new props are/were undefined", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      company: "disney",
      lastUpdated: 12345,
    });
    const roger = await Record.get(Person, "8888");
    await roger.update({
      tags: { "456": "something else" },
      scratchpad: { foo: "bar" },
    });

    // IMMEDIATE CHANGE on RECORD
    expect(roger.get("scratchpad")).toHaveProperty("foo");
    expect(roger.get("tags")).toHaveProperty("456");
    // CHANGE REFLECTED after pulling from DB
    const bugs = await Record.get(Person, "8888");

    expect(bugs.get("tags")).toHaveProperty("456");
    expect(bugs.get("scratchpad")).toHaveProperty("foo");
  });

  it("using update triggers correct client-side events", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      company: "disney",
      lastUpdated: 12345,
    });
    const roger = await Record.get(Person, "8888");
    const events: IFmWatchEvent[] = [];
    FireModel.dispatch = async (evt: IFmWatchEvent) => events.push(evt);
    expect(roger.dispatchIsActive).toBe(true);
    await roger.update({
      name: "Roger Rabbit, III",
      age: 4,
    });
    await roger.update({
      age: 13,
    });
    FireModel.dispatch = null;
    expect(events).toHaveLength(4);
    expect(roger.get("name")).toBe("Roger Rabbit, III");
    expect(roger.get("age")).toBe(13);
  });

  it("calling dbPath() before the ID is known provides useful error", async () => {
    const record = Record.create(Person, { db });

    try {
      const foo = record.dbPath;
      throw new Error("Error should have happened");
    } catch (e) {
      expect(e.code).toBe("not-ready");
      expect(e.name).toBe("record/not-ready");
      expect(e.message).toContain("dbPath before");
    }
  });

  it("calling remove() removes from DB and notifies FE state-mgmt", async () => {
    jest.setTimeout(3000);
    await Mock(Person, db).generate(10);
    const peeps = await List.all(Person);
    expect(peeps.length).toBe(10);
    const person = Record.createWith(Person, peeps.data[0]);
    const id = person.id;
    const events: IFmWatchEvent[] = [];
    FireModel.dispatch = async (evt: IFmWatchEvent) => events.push(evt);
    await person.remove();

    expect(events).toHaveLength(2);
    const eventTypes = new Set(events.map((e) => e.type));
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_LOCALLY)).toBe(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_CONFIRMATION)).toBe(true);

    const peeps2 = await List.all(Person);

    expect(peeps2).toHaveLength(9);
    const ids = peeps2.map((p) => p.id);
    expect(ids.includes(id)).toBe(false);
  });

  it("calling static remove() removes from DB, notifies FE state-mgmt", async () => {
    jest.setTimeout(3000);
    await Mock(Person, db).generate(10);
    const peeps = await List.all(Person);
    const id = peeps.data[0].id;
    expect(peeps.length).toBe(10);
    const events: IFmWatchEvent[] = [];
    FireModel.dispatch = async (evt: IFmWatchEvent) => events.push(evt);
    const removed = await Record.remove(Person, id);
    expect(removed.id).toBe(id);
    expect(events).toHaveLength(2);
    const eventTypes = new Set(events.map((e) => e.type));
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_LOCALLY)).toBe(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_ROLLBACK)).toBe(true);

    const peeps2 = await List.all(Person);
    expect(peeps2).toHaveLength(9);
    const ids = peeps2.map((p) => p.id);
    expect(ids.includes(id)).toBe(false);
  });

  it("setting an explicit value for plural is picked up by Record", async () => {
    const p = Record.create(Peeps);
    expect(p.modelName).toBe("person");
    expect(p.META.plural).toBe("peeps");
    expect(p.pluralName).toBe("peeps");
  });
});
