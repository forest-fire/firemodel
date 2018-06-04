// tslint:disable:no-implicit-dependencies
import Model, { Record } from "../src/index";
import DB from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";

describe("Record > ", () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
    Model.defaultDb = db;
    db.resetMockDb();
    const now = new Date().getTime();
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 }),
        lastUpdated: now,
        createdAt: now
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 10).generate();
  });

  it("Record's add() factory adds record to database", async () => {
    const r = await Record.add(Person, {
      name: "Bob",
      age: 40
    });
    expect(r).to.be.instanceof(Record);
    expect(r.get("name")).to.equal("Bob");
    expect(r.id).to.exist.and.be.a("string");
  });

  it("Record's load() populates state, does not add to db", async () => {
    const r = Record.load(Person, {
      name: "Bob",
      age: 40
    });
    expect(r).to.be.instanceof(Record);
    expect(r.get("name")).to.equal("Bob");
    expect(r.id).to.be.an("undefined");
  });

  it("Once an ID is set it can not be reset", async () => {
    const r = await Record.add(Person, {
      name: "Bob",
      age: 40
    });
    const id = r.id;
    try {
      r.id = "12345";
      throw new Error("Let ID be reset!");
    } catch (e) {
      expect(r.id).to.equal(id);
      expect(e.name).to.equal("NotAllowed");
    }
  });

  it("Record's add() factor disallows the addition of state which already has an ID", async () => {
    try {
      const r = await Record.add(Person, {
        id: "invalid",
        name: "Bob",
        age: 40
      });
      throw new Error("Allowed addition when ID was part of payload!");
    } catch (e) {
      // do nothing
    }
  });

  it("using pushKey sets state locally immediately", async () => {
    db.set<Person>("/authenticated/people/1234", {
      name: "Bart Simpson",
      age: 10
    });
    const bart = await Record.get(Person, "1234", { db });
    const k1 = await bart.pushKey("tags", "doh!");
    const k2 = await bart.pushKey("tags", "whazzup?");
    expect(bart.data.tags[k1]).to.equal("doh!");
    expect(bart.data.tags[k2]).to.equal("whazzup?");
    expect(Object.keys(bart.data.tags).length).to.equal(2);
  });

  it("using pushKey updates lastUpdated", async () => {
    const now = new Date().getTime();
    await db.set<Person>("/authenticated/people/1234", {
      name: "Bart Simpson",
      age: 10,
      lastUpdated: now,
      createdAt: now
    });
    const bart = await Record.get(Person, "1234", { db });
    const backThen = bart.data.createdAt;

    expect(bart.data.lastUpdated).to.equal(backThen);
    const pk = await bart.pushKey("tags", "doh!");
    const result = await Record.get(Person, "1234", { db });

    expect(result.data.tags[pk]).to.equal("doh!");
    expect(result.data.lastUpdated).to.be.greaterThan(backThen);
    expect(result.data.createdAt).to.equal(backThen);
  });

  it("create Record with static get() factory", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      tags: { 123: "cartoon" },
      employerId: "disney"
    });
    const roger = await Record.get(Person, "8888");
    expect(roger).to.be.an.instanceOf(Record);
    expect(roger.data).to.be.an.instanceOf(Person);
    expect(roger.get("name")).to.equal("Roger Rabbit");
    expect(roger.get("age")).to.equal(3);
    expect(roger.get("employerId")).to.equal("disney");
    expect(roger.data.tags["123"]).to.equal("cartoon");
  });

  it("using updateProps() allows updating multiple props (incl lastUpdated) which are reflected on record immediately", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      tags: { 123: "cartoon" },
      employerId: "disney",
      lastUpdated: 12345
    });
    const roger = await Record.get(Person, "8888");
    await roger.updateProps({
      name: "Bugs Bunny",
      employerId: "rogue"
    });
    // IMMEDIATE CHANGE on RECORD
    expect(roger.get("name")).to.equal("Bugs Bunny");
    expect(roger.get("age")).to.equal(3);
    expect(roger.get("employerId")).to.equal("rogue");
    expect(roger.data.tags["123"]).to.equal("cartoon");
    expect(roger.get("lastUpdated"))
      .to.be.a("number")
      .and.not.equal(12345);
    // CHANGE REFLECTED on RELOAD from DB
    const bugs = await Record.get(Person, "8888");
    expect(bugs.get("name")).to.equal("Bugs Bunny");
    expect(bugs.get("age")).to.equal(3);
    expect(bugs.get("employerId")).to.equal("rogue");
    expect(bugs.data.tags["123"]).to.equal("cartoon");
    expect(bugs.get("lastUpdated")).to.equal(roger.get("lastUpdated"));
  });

  it("using updateProps() allows non-destructive updates on object types", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      tags: { "123": "cartoon" },
      employerId: "disney",
      lastUpdated: 12345
    });
    const roger = await Record.get(Person, "8888");
    await roger.updateProps({
      tags: { "456": "something else" }
    });
    // IMMEDIATE CHANGE on RECORD
    expect(roger.get("tags")).to.haveOwnProperty("123");
    expect(roger.get("tags")).to.haveOwnProperty("456");
    // CHANGE REFLECTED after pulling from DB
    const bugs = await Record.get(Person, "8888");
    expect(bugs.get("tags")).to.haveOwnProperty("123");
    expect(bugs.get("tags")).to.haveOwnProperty("456");
  });

  it("using updateProps() allows non-destructive updates on object type when initial value is undefined", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      employerId: "disney",
      lastUpdated: 12345
    });
    const roger = await Record.get(Person, "8888");
    await roger.updateProps({
      tags: { "456": "something else" },
      scratchpad: { foo: "bar" }
    });
    // IMMEDIATE CHANGE on RECORD
    expect(roger.get("tags")).to.haveOwnProperty("456");
    expect(roger.get("scratchpad")).to.haveOwnProperty("foo");
    // CHANGE REFLECTED after pulling from DB
    const bugs = await Record.get(Person, "8888");
    expect(bugs.get("tags")).to.haveOwnProperty("456");
    expect(bugs.get("scratchpad")).to.haveOwnProperty("foo");
  });

  it("calling dbPath() before the ID is known provides useful error", async () => {
    const record = Record.create(Person, { db });

    try {
      const foo = record.dbPath;
      throw new Error("Error should have happened");
    } catch (e) {
      expect(e.code).to.equal("record/invalid-path");
      expect(e.message).contains("Invalid Record Path");
    }
  });

  it("State of Model's Schema class is not changed due to record information coming in", async () => {
    const record = Record.create(Person, { db });
    const record2 = Record.create(Person, { db });
    expect(record.data).to.not.equal(record2.data);
    expect(record.get("age")).to.equal(undefined);
    expect(record2.get("age")).to.equal(undefined);
    record._initialize({
      name: "Bob",
      age: 12
    });
    expect(record.get("age")).to.equal(12);
    const record3 = Record.create(Person, { db });
    expect(record3.get("age")).to.equal(undefined);
    expect(record2.get("age")).to.equal(undefined);
    expect(record.get("name")).to.equal("Bob");
    expect(record2.get("name")).to.equal(undefined);
  });
});
