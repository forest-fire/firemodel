// tslint:disable:no-implicit-dependencies
import { Record, List } from "../src";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";
import { Person as Peeps } from "./testing/PersonAsPeeps";
import { FireModel } from "../src/FireModel";
import { IFMRecordEvent, FmEvents } from "../src/state-mgmt";
import { Mock } from "../src/Mock";

describe("Record > ", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
    FireModel.defaultDb = db;
    FireModel.dispatch = null;
  });

  it("can instantiate with new operator", async () => {
    const person = new Record(Person);
    expect(person.modelName).to.equal("person");
  });

  it("Record's add() factory adds record to database", async () => {
    const r = await Record.add(Person, {
      name: "Bob Marley",
      age: 40
    });
    expect(r).to.be.instanceof(Record);
    expect(r.get("name")).to.equal("Bob Marley");
    expect(r.id).to.exist.and.be.a("string");
    // test DB too
    const fromDb = await Record.get(Person, r.id);
    expect(fromDb).to.be.instanceof(Record);
    expect(fromDb.get("name")).to.equal("Bob Marley");
    expect(fromDb.id).to.exist.and.be.a("string");
  });

  it(`Record's static add() fires client events`, async () => {
    const events: IFMRecordEvent[] = [];
    Record.dispatch = (payload: IFMRecordEvent) => events.push(payload);
    const r = await Record.add(Person, {
      name: "Bob",
      age: 40
    });
    expect(events).to.have.lengthOf(2);
    const eventTypes = new Set(events.map(e => e.type));
    expect(eventTypes.has(FmEvents.RECORD_ADDED_CONFIRMATION)).to.equal(true);
    expect(eventTypes.has(FmEvents.RECORD_ADDED_LOCALLY)).to.equal(true);
  });

  it("Record's load() populates state, does not add to db", async () => {
    const r = Record.createWith(Person, {
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
      expect(e.name).to.equal("firemodel/not-allowed");
      expect(e.code).to.equal("not-allowed");
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
      company: "disney"
    });
    const roger = await Record.get(Person, "8888");
    expect(roger).to.be.an.instanceOf(Record);
    expect(roger.data).to.be.an.instanceOf(Person);
    expect(roger.get("name")).to.equal("Roger Rabbit");
    expect(roger.get("age")).to.equal(3);
    expect(roger.get("company")).to.equal("disney");
    expect(roger.data.tags["123"]).to.equal("cartoon");
  });

  it("using update() allows non-destructive updates on object type when new props are/were undefined", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      company: "disney",
      lastUpdated: 12345
    });
    const roger = await Record.get(Person, "8888");
    await roger.update({
      tags: { "456": "something else" },
      scratchpad: { foo: "bar" }
    });

    // IMMEDIATE CHANGE on RECORD
    expect(roger.get("scratchpad")).to.haveOwnProperty("foo");
    expect(roger.get("tags")).to.haveOwnProperty("456");
    // CHANGE REFLECTED after pulling from DB
    const bugs = await Record.get(Person, "8888");
    expect(bugs.get("tags")).to.haveOwnProperty("456");
    expect(bugs.get("scratchpad")).to.haveOwnProperty("foo");
  });

  it("using update triggers correct client-side events", async () => {
    await db.set<Person>("/authenticated/people/8888", {
      name: "Roger Rabbit",
      age: 3,
      company: "disney",
      lastUpdated: 12345
    });
    const roger = await Record.get(Person, "8888");
    const events: IFMRecordEvent[] = [];
    FireModel.dispatch = (evt: IFMRecordEvent) => events.push(evt);
    expect(roger.dispatchIsActive).to.equal(true);
    await roger.update({
      name: "Roger Rabbit, III",
      age: 4
    });
    await roger.update({
      age: 13
    });
    FireModel.dispatch = null;
    expect(events).to.have.lengthOf(4);
    expect(roger.get("name")).to.equal("Roger Rabbit, III");
    expect(roger.get("age")).to.equal(13);
  });

  it("calling dbPath() before the ID is known provides useful error", async () => {
    const record = Record.create(Person, { db });

    try {
      const foo = record.dbPath;
      throw new Error("Error should have happened");
    } catch (e) {
      expect(e.code).to.equal("not-ready");
      expect(e.name).to.equal("record/not-ready");
      expect(e.message).contains("dbPath before");
    }
  });

  it("calling remove() removes from DB and notifies FE state-mgmt", async () => {
    await Mock(Person, db)
      .createRelationshipLinks()
      .generate(10);
    const peeps = await List.all(Person);
    expect(peeps.length).to.equal(10);
    const person = Record.createWith(Person, peeps.data[0]);
    const id = person.id;
    const events: IFMRecordEvent[] = [];
    FireModel.dispatch = (evt: IFMRecordEvent) => events.push(evt);
    await person.remove();

    expect(events).to.have.lengthOf(2);
    const eventTypes = new Set(events.map(e => e.type));
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_LOCALLY)).is.equal(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_CONFIRMATION)).is.equal(true);

    const peeps2 = await List.all(Person);

    expect(peeps2).to.have.lengthOf(9);
    const ids = peeps2.map(p => p.id);
    expect(ids.includes(id)).to.equal(false);
  }).timeout(3000);

  it("calling static remove() removes from DB, notifies FE state-mgmt", async () => {
    await Mock(Person, db)
      .createRelationshipLinks()
      .generate(10);
    const peeps = await List.all(Person);
    const id = peeps.data[0].id;
    expect(peeps.length).to.equal(10);
    const events: IFMRecordEvent[] = [];
    FireModel.dispatch = (evt: IFMRecordEvent) => events.push(evt);
    const removed = await Record.remove(Person, id);
    expect(removed.id).to.equal(id);
    expect(events).to.have.lengthOf(2);
    const eventTypes = new Set(events.map(e => e.type));
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_LOCALLY)).is.equal(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_ROLLBACK)).is.equal(true);

    const peeps2 = await List.all(Person);
    expect(peeps2).to.have.lengthOf(9);
    const ids = peeps2.map(p => p.id);
    expect(ids.includes(id)).to.equal(false);
  }).timeout(3000);

  it("setting an explicit value for plural is picked up by Record", async () => {
    const p = Record.create(Peeps);
    expect(p.modelName).to.equal("person");
    expect(p.META.plural).to.equal("peeps");
    expect(p.pluralName).to.equal("peeps");
  });
}).timeout(4000);
