// tslint:disable:no-implicit-dependencies
import {
  Model,
  BaseSchema,
  Record,
  List,
  IAuditRecord,
  FirebaseCrudOperations
} from "../src/index";
import DB from "abstracted-admin";
import { SchemaCallback } from "firemock";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
import "reflect-metadata";
import { Klass, ContainedKlass, SubKlass } from "./testing/klass";
import { Person } from "./testing/person";
import { Company } from "./testing/company";
import { VerboseError } from "common-types";
import { get as getStackFrame, parse as stackParse } from "stack-trace";

VerboseError.setStackParser((context: VerboseError) => stackParse(context));

describe("Model > CRUD Ops: ", () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
  });

  it("Model.push() works", async () => {
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema<Person>("person", 25);
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const response = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });

    const people = await PersonModel.getAll();
    expect(people.length).to.equal(26);
    const charlie = await PersonModel.findRecord("name", "Charlie Chaplin");
    expect(charlie.data.age).to.equal(84);
  });

  it("Model.update() works", async () => {
    const PersonModel = new Model<Person>(Person, db);
    const ref = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });
    await helpers.timeout(50);
    await PersonModel.update(ref.key, { age: 100 });
    const charlie = await PersonModel.findRecord("name", "Charlie Chaplin");
    expect(charlie.data.age).to.equal(100);
    expect(charlie.data.lastUpdated).is.not.equal(charlie.data.createdAt);
  });

  it("Model.remove() works with default params", async () => {
    const PersonModel = new Model<Person>(Person, db);
    await PersonModel.push({ name: "Bob Geldoff", age: 65 });
    const ref = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });
    const nada = await PersonModel.remove(ref.key);
    const people = await PersonModel.getAll();
    expect(people.length).to.equal(1);
    expect(people.data[0].name).to.equal("Bob Geldoff");
    expect(nada).to.be.a("undefined");
  });

  it("Model.set() works when ID is present", async () => {
    db.resetMockDb();
    const PersonModel = new Model<Person>(Person, db);
    const ref = await PersonModel.set({
      id: "bob",
      name: "Bobby Geldoff",
      age: 65
    });

    // const nada = await PersonModel.remove(ref.key);
    const bob = await PersonModel.getRecord("bob");
    const val = await db.getList("/people");
    expect(bob).to.be.an("object");
    console.log(val);

    expect(bob.data.name).to.be.equal("Bobby Geldoff");
    const people = await PersonModel.getAll();
    console.log(people.data);
    expect(people.data).to.have.lengthOf(1);

    // expect(people.data[0].name).to.equal('Bob Geldoff');
    // expect(nada).to.be.a('undefined');
  });

  it("Model.remove() returns the previous value when asked for it", async () => {
    const PersonModel = new Model<Person>(Person, db);
    await PersonModel.push({ name: "Bob Geldoff", age: 65 });
    const ref = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });
    const previous = await PersonModel.remove(ref.key, true);
    const people = await PersonModel.getAll();

    expect(people.length).to.equal(1);
    expect(people.data[0].name).to.equal("Bob Geldoff");
    expect(previous.name).to.equal("Charlie Chaplin");
  });

  it.skip("Model.updateWhere() works");
});
