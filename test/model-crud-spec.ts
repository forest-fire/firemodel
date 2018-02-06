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
import { VerboseError } from "../src/VerboseError";
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

    const peeps = await PersonModel.getAll();
    expect(peeps.length).to.equal(26);
    const charlie = await PersonModel.findRecord("name", "Charlie Chaplin");
    expect(charlie.data.age).to.equal(84);
  });

  it("Model.update() works", async () => {
    const PersonModel = new Model<Person>(Person, db);
    const ref = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });
    console.log(ref.key);

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
    const peeps = await PersonModel.getAll();
    console.log(peeps.data);

    expect(peeps.length).to.equal(1);
    expect(peeps.data[0].name).to.equal("Bob Geldoff");
    expect(nada).to.be.a("undefined");
  });

  it("Model.set() works when ID is present", async () => {
    db.resetMockDb();
    const PersonModel = new Model<Person>(Person, db);
    await PersonModel.set({
      id: "bob",
      name: "Bobby Geldoff",
      age: 65
    });

    const bob = await PersonModel.getRecord("bob");
    const val = await db.getList("/peeps");
    expect(bob).to.be.an("object");
    console.log(val);

    expect(bob.data.name).to.be.equal("Bobby Geldoff");
    const peeps = await PersonModel.getAll();
    expect(peeps.data).to.have.lengthOf(1);
    expect(peeps.data[0].name).to.equal("Bobby Geldoff");
  });

  it("Model.remove() returns the previous value when asked for it", async () => {
    db.resetMockDb();
    const People = new Model<Person>(Person, db);
    await People.push({ name: "Bob Geldoff", age: 65 });
    const ref = await People.push({
      name: "Charlie Chaplin",
      age: 84
    });
    const previous = await People.remove(ref.key, true);
    const peeps = await People.getAll();

    expect(peeps.length).to.equal(1);
    expect(peeps.data[0].name).to.equal("Bob Geldoff");
    expect(previous.name).to.equal("Charlie Chaplin");
  });

  it.skip("Model.updateWhere() works");
});
