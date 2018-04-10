// tslint:disable:no-implicit-dependencies
import { Model, Record, List } from "../src/index";
import DB from "abstracted-admin";
import { SchemaCallback } from "firemock";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Klass, ContainedKlass, SubKlass } from "./testing/klass";
import { Person } from "./testing/person";
import { VerboseError } from "../src/VerboseError";
import { parse as stackParse } from "stack-trace";

VerboseError.setStackParser((context: VerboseError) => stackParse(context));

describe("Model > find API: ", () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
  });

  it("Model.findAll() with default equality operator works", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 25, { age: 10 });
    db.mock.queueSchema<Person>("person", 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll("age", 70);
    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(25);
  });

  it("Model.findAll() works with overriden equality operator", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 25, { age: 10 });
    db.mock.queueSchema<Person>("person", 25, { age: 60 });
    db.mock.queueSchema<Person>("person", 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll("age", ["=", 60]);
    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(25);
  });

  it("Model.findAll() works with overriden greater-than operator", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 25, { age: 10 });
    db.mock.queueSchema<Person>("person", 25, { age: 60 });
    db.mock.queueSchema<Person>("person", 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll("age", [">", 60]);
    const allPeople = await PersonModel.getAll();

    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(50);
  });
  it("Model.findAll() with overriden less-than operator works", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 25, { age: 10 });
    db.mock.queueSchema<Person>("person", 25, { age: 60 });
    db.mock.queueSchema<Person>("person", 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll("age", ["<", 20]);
    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(25);
  });

  it("Model.findRecord hands back populated Record", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 60 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 25, { age: 70 });
    db.mock.queueSchema<Person>("person", 1, { age: 64, name: "Bob" });
    db.mock.generate();
    const People = new Model<Person>(Person, db);
    const person = await People.findRecord("age", 64);
    expect(person).to.be.instanceOf(Record);
    expect(person.data).to.be.instanceof(Person);
    expect(person.data.age).to.equal(64);
    expect(person.data.name).to.equal("Bob");
    expect(person.META.pushKeys).to.include("tags");
  });

  it("Model.findRecord returns only the FIRST record when encountering multiple matches", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 60 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 1, { age: 64, name: "Bob" });
    db.mock.queueSchema<Person>("person", 1, { age: 64, name: "Roger" });
    db.mock.generate();
    const People = new Model<Person>(Person, db);
    const person = await People.findRecord("age", 64);
    expect(person.data.age).to.equal(64);
    expect(person.data.name).to.equal("Bob");
  });

  it("Model.findRecord throw error when no matches are found", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 60 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 25, { age: 60 });
    db.mock.queueSchema<Person>("person", 1, { age: 64, name: "Bob" });
    db.mock.generate();
    const People = new Model<Person>(Person, db);
    try {
      await People.findRecord("age", 66);
      throw new Error("Should have thrown error when no records found");
    } catch (e) {
      expect(e.code).to.equal("not-found");
    }
  });

  it("Model.findRecord throw error database is non-existant", async () => {
    const People = new Model<Person>(Person, db);
    try {
      await People.findRecord("age", 66);
      throw new Error("Should have thrown error when no records found");
    } catch (e) {
      expect(e.code).to.equal("not-found");
    }
  });
});
