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
    db.resetMockDb();
  });

  it("Write operations include both dbOffset and plural model name", async () => {
    const PersonModel = new Model<Person>(Person, db);
    const response = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });
    const id = response.key.split("/").pop();
    let peeps = await db.getList<Person>(`authenticated/people`);
    expect(PersonModel.pluralName).to.equal("people");
    expect(db.mock.db.authenticated.people[id]).to.not.equal("undefined");
    expect(peeps).to.be.an("array");
    expect(peeps[0].id).to.equal(id);
    expect(peeps[0].age).to.equal(84);

    await PersonModel.update(id, { age: 99 });
    peeps = await db.getList<Person>(`authenticated/people`);
    expect(peeps[0].age).to.equal(99);
    await PersonModel.set({
      id: "1234",
      name: "Bilbo Baggins",
      age: 12
    });
    peeps = await db.getList<Person>(`authenticated/people`);
    expect(peeps.length).to.equal(2);
    expect(peeps.filter(p => p.id === "1234")[0].age).to.equal(12);
    await PersonModel.remove("1234");
    peeps = await db.getList<Person>(`authenticated/people`);
    expect(peeps.length).to.equal(1);
    expect(peeps[0].age).to.equal(99);
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

    await PersonModel.update(ref.key.split("/").pop(), { age: 100 });
    const charlie = await PersonModel.findRecord("name", "Charlie Chaplin");
    expect(charlie.data.age).to.equal(100);
    expect(charlie.data.lastUpdated).is.not.equal(charlie.data.createdAt);
  });

  it("Model.remove() works with default params", async () => {
    const PersonModel = new Model<Person>(Person, db);
    const bob = await PersonModel.push({ name: "Bob Geldoff", age: 65 });
    const charlie = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });
    const nada = await PersonModel.remove(charlie.key);
    const peeps = await PersonModel.getAll();

    expect(peeps.length).to.equal(1);
    expect(peeps.data[0].name).to.equal("Bob Geldoff");
    expect(nada).to.be.a("undefined");
  });

  it("Model.multiPathUpdate() works", async () => {
    const PersonModel = new Model<Person>(Person, db);
    await PersonModel.set({
      id: "1234",
      name: "Charlie Chaplin",
      age: 84,
      gender: "male"
    });
    await PersonModel.set({
      id: "4567",
      name: "Bob Barker",
      age: 99,
      gender: "male"
    });
    PersonModel.multiPathUpdate([
      {
        id: "1234",
        name: "Foo Manny Chooey",
        age: 15,
        gender: "female"
      },
      {
        id: "4567",
        name: "Chris Christofferson"
      }
    ]);
    const peeps = await PersonModel.getAll();
    const r1234 = peeps.data.filter(r => r.id === "1234")[0];
    const r4567 = peeps.data.filter(r => r.id === "4567")[0];
    console.log(Object.keys(db.mock.db.authenticated.people));
    console.log(db.mock.db.authenticated.people["4567"]);

    expect(r1234.age).to.equal(15);
    expect(r1234.gender).to.equal("female");

    expect(r4567.name).to.equal("Chris Christofferson");
    expect(r4567.age).to.equal(99);
  });

  it("Model.set() works when ID is present", async () => {
    const PersonModel = new Model<Person>(Person, db);
    await PersonModel.set({
      id: "bob",
      name: "Bobby Geldoff",
      age: 65
    });

    const bob = await PersonModel.getRecord("bob");
    const val = await db.getList("/peeps");
    expect(bob).to.be.an("object");

    expect(bob.data.name).to.be.equal("Bobby Geldoff");
    const peeps = await PersonModel.getAll();
    expect(peeps.data).to.have.lengthOf(1);
    expect(peeps.data[0].name).to.equal("Bobby Geldoff");
  });

  it("Model.push() throws an error when no ID is present", async () => {
    const PersonModel = new Model<Person>(Person, db);
    try {
      await PersonModel.set({
        name: "Bobby Geldoff",
        age: 65
      });
      throw new Error("Setting a person without an ID should not be allowed");
    } catch (e) {
      expect(e.code).to.equal("set/no-id");
    }
  });

  it("Model.remove() returns the previous value when asked for it", async () => {
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

  it("Model.remove() doesn't return the previous value by default", async () => {
    db.resetMockDb();
    const People = new Model<Person>(Person, db);
    const bob = await People.push({ name: "Bob Geldoff", age: 65 });
    const charlie = await People.push({
      name: "Charlie Chaplin",
      age: 84
    });
    let peeps = await People.getAll();
    expect(peeps.length).to.equal(2);
    const previous = await People.remove(charlie.key); // removed with full path
    peeps = await People.getAll();
    expect(peeps.length).to.equal(1);
    expect(previous).to.equal(undefined);

    await People.remove(bob.key.split("/").pop()); // removed with just the 'id'
    peeps = await People.getAll();
    expect(peeps.length).to.equal(0);
  });

  it.skip("Model.updateWhere() works");
});
