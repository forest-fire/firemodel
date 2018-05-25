// tslint:disable:no-implicit-dependencies
import { Model, BaseSchema, Record, List } from "../src/index";
import DB, { SerializedQuery } from "abstracted-admin";
import SchemaHelper, { SchemaCallback } from "firemock";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";

describe("List class: ", () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
    Model.defaultDb = db;
  });
  it("can instantiate with new operator", () => {
    const PersonModel = Model.create(Person, { db });
    const list = new List<Person>(PersonModel);
    expect(list).to.be.instanceof(List);
    expect(list.length).to.equal(0);
    expect(list.modelName).to.equal("person");
    expect(list.pluralName).to.equal("people");
    expect(list.dbPath).to.equal(`${list.meta.dbOffset}/people`);
  });

  it("can instantiate with create() method", () => {
    const list = List.create(Person, { db });
    expect(list).to.be.instanceof(List);
    expect(list.length).to.equal(0);
    expect(list.modelName).to.equal("person");
    expect(list.pluralName).to.equal("people");
    expect(list.dbPath).to.equal(`${list.meta.dbOffset}/people`);
  });

  it("can instantiate with from() method", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 25).generate();

    const q = new SerializedQuery().limitToLast(5);
    const results = await List.from(Person, q, { db });
    expect(results.length).to.equal(5);
  });

  it("can instantiate with a where() method", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 })
      }))
      .pathPrefix("authenticated");
    db.mock
      .queueSchema("person", 10)
      .queueSchema("person", 2, { age: 99 })
      .generate();

    const oldFolks = await List.where(Person, "age", 99);
    const youngFolks = await List.where(Person, "age", ["<", 90]);

    expect(oldFolks).to.be.an.instanceof(List);
    expect(youngFolks).to.be.an.instanceof(List);
    expect(oldFolks.length).to.equal(2);
    expect(youngFolks.length).to.equal(10);
  });

  it("can instantiate with first() and last() methods", async () => {
    db.mock
      .addSchema<Person>("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf()
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 30).generate();
    const first = await List.first(Person, 5);
    const last = await List.last(Person, 5);
    const firstCreatedDate = first.data[0].createdAt;
    const lastCreatedDate = last.data[0].createdAt;

    expect(first).to.be.length(5);
    expect(last).to.be.length(5);
    expect(firstCreatedDate).to.be.lessThan(lastCreatedDate);
  });

  it("can instantiate with recent(), and inactive() methods", async () => {
    db.mock
      .addSchema<Person>("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf()
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 30).generate();
    const recent = await List.recent(Person, 6);
    const inactive = await List.inactive(Person, 4);
    const recentCreatedDate = recent.data[0].lastUpdated;
    const inactiveCreatedDate = inactive.data[0].lastUpdated;

    expect(recent).to.be.length(6);
    expect(inactive).to.be.length(4);
    expect(recentCreatedDate).to.be.greaterThan(inactiveCreatedDate);
  });

  it("an instantiated List can call get() with a valid ID and get a Record", async () => {
    db.mock
      .addSchema<Person>("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf()
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 30).generate();
    const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
    const list = await List.all(Person);
    const record = list.get(firstPersonId);
    expect(record).to.be.an("object");
    expect(record).to.be.an.instanceOf(Record);
    expect(record.data).to.be.an.instanceOf(Person);
    expect(record.data.name).to.be.a("string");
  });

  it("an instantiated List can call getModel() with a valid ID and get a Model", async () => {
    db.mock
      .addSchema<Person>("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf()
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 30).generate();
    const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
    const list = await List.all(Person);
    const person = list.getModel(firstPersonId);
    expect(person).to.be.an("object");
    expect(person).to.be.an.instanceOf(Person);
    expect(person.name).to.be.a("string");
  });

  it("an instantiated List calling get() with an invalid ID throws an error", async () => {
    db.mock
      .addSchema<Person>("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 50 }),
        createdAt: h.faker.date.past().valueOf(),
        lastUpdated: h.faker.date.recent().valueOf()
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("person", 30).generate();
    const list = await List.all(Person);
    try {
      const record = list.get("not-there");
      throw new Error("Invalid ID should have thrown error");
    } catch (e) {
      expect(e.name).to.equal("NotFound");
    }
  });
});
