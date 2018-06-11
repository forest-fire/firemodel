// tslint:disable:no-implicit-dependencies
import { Model, BaseSchema, Record, List } from "../src/index";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";
import { ILogger } from "../src/model";

describe("Model", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
  });

  it("can be created with create() static method", () => {
    const People = Model.create(Person);
    expect(People).to.be.instanceOf(Model);
    expect(People.modelName).to.equal("person");
    expect(People.pluralName).to.equal("people");
    expect(People.pushKeys).to.contain("tags");
  });

  it("can be created with create() static method, and logger specified", () => {
    const messages = [];
    const myLogger: ILogger = {
      log: (msg: string) => messages.push(msg),
      warn: (msg: string) => messages.push(msg),
      debug: (msg: string) => messages.push(msg),
      error: (msg: string) => messages.push(msg)
    };
    const People = Model.create(Person, { logger: myLogger });
    expect(People).to.be.instanceOf(Model);
    expect(People.modelName).to.equal("person");
    expect(People.pluralName).to.equal("people");
    expect(People.pushKeys).to.contain("tags");
  });

  it("modelName and pluralName properties are correct", () => {
    const person = new Model<Person>(Person, db);
    expect(person.modelName).to.equal("person");
    expect(person.pluralName).to.equal("people");
    person.pluralName = "testing";
    expect(person.pluralName).to.equal("testing");
  });

  it("getRecord() retrieves a record from the DB", async () => {
    const PersonModel = new Model<Person>(Person, db);
    await db.set<Person>("/authenticated/people/1234", {
      name: "Billy Bob",
      age: 45
    });
    const billy = await PersonModel.getRecord("1234");
    expect(billy.existsOnDB).to.equal(true);
    expect(billy.data.name).to.equal("Billy Bob");
    expect(billy.data.age).to.equal(45);
  });

  it("findRecord(prop, val) works", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 20);
    db.mock.queueSchema<Person>("person", 1, { name: "Roger Rabbit" });
    db.mock.queueSchema<Person>("person", 2, { name: "John Smith", age: 100 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const roger = await PersonModel.findRecord("name", "Roger Rabbit");
    expect(roger).to.be.instanceof(Record);
    expect(roger.data.name).to.equal("Roger Rabbit");
    expect(roger.get("name")).to.equal("Roger Rabbit");
    expect(roger.id).to.equal(roger.data.id);
    expect(roger.dbPath).to.contain(roger.data.id);
    expect(roger.dbPath).to.contain("authenticated/people");
    const john = await PersonModel.findRecord("name", "John Smith");
    expect(john.data.age).to.equal(100);
  });

  it(`findRecord() throws error if no record found`, async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 50);
    const PersonModel = new Model<Person>(Person, db);
    try {
      const doesNotExist = await PersonModel.findRecord("age", 500);
      expect(false, "Should have thrown error when no result found").to.equal(true);
    } catch (e) {
      expect(e.code).to.equal("not-found");
    }
  });

  it("Model.getAll() retrieves a List of records from DB", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 50);
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const list = await PersonModel.getAll();
    expect(list).to.be.instanceof(List);
    expect(list.data).to.an("array");
    expect(list.length).to.equal(50);
    expect(list.data[0].name).to.be.a("string");
    expect(list.data[0].age).to.be.a("number");
    expect(list.meta.property("name").type).to.equal("String");
  });
});
