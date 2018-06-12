// tslint:disable:no-implicit-dependencies
import { OldModel, Record, List } from "../src";
import { DB } from "abstracted-admin";
import { SchemaCallback, Reference } from "firemock";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";

describe("Model > CRUD Ops: ", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
  });

  it("Write operations include both dbOffset and plural model name", async () => {
    const PersonModel = new OldModel<Person>(Person, db);
    const response = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });

    const id = response.key.split("/").pop();

    let peeps = await db.getList<Person>(`authenticated/people`);

    expect(PersonModel.pluralName).to.equal("people");
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
    const PersonModel = Record.create(Person, { db });
    await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });

    const peeps = await PersonModel.getAll();
    expect(peeps.length).to.equal(26);
    const charlie = await peeps.find(p => p.name === "Charlie Chaplin");
    expect(charlie.data.age).to.equal(84);
  });

  it("Model.update() works", async () => {
    const PersonModel = new OldModel<Person>(Person, db);
    const charlie = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });

    expect(charlie).to.be.an.instanceOf(Reference);
    const snap = await charlie.once("value");
    expect(snap.val().age).to.equal(84);

    await PersonModel.update(charlie.id, { age: 100 });
    const list = await List.where(Person, "name", "Charlie Chaplin");
    console.log(list.data);

    expect(list)
      .is.an.instanceOf(List)
      .and.has.length(1);
    const c2 = list.data[0];
    expect(c2.age).to.equal(100);
    expect(c2.lastUpdated).is.not.equal(c2.createdAt);
  });

  it("Model.remove() works with default params", async () => {
    const PersonModel = new OldModel<Person>(Person, db);
    const bob = await PersonModel.push({ name: "Bob Geldoff", age: 65 });
    const charlie = await PersonModel.push({
      name: "Charlie Chaplin",
      age: 84
    });
    const nada = await PersonModel.remove(charlie.id);
    const peeps = await PersonModel.getAll();

    expect(peeps.length).to.equal(1);
    expect(peeps.data[0].name).to.equal("Bob Geldoff");
    expect(nada).to.be.a("undefined");
  });

  it("Model.set() works when ID is present", async () => {
    const PersonModel = new OldModel<Person>(Person, db);
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
    const PersonModel = Model.create(Person, { db });
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
    const People = new OldModel<Person>(Person, db);
    await People.push({ name: "Bob Geldoff", age: 65 });
    const ref = await People.push({
      name: "Charlie Chaplin",
      age: 84
    });
    const previous = await People.remove(ref.id, true);

    const peeps = await People.getAll();

    expect(peeps.length).to.equal(1);
    expect(peeps.data[0].name).to.equal("Bob Geldoff");
    expect(previous.name).to.equal("Charlie Chaplin");
  });

  it("Model.remove() doesn't return the previous value by default", async () => {
    const People = Model.create(Person, { db });
    const bob = await People.push({ name: "Bob Geldoff", age: 65 });
    const charlie = await People.push({
      name: "Charlie Chaplin",
      age: 84
    });
    let peeps = await People.getAll();
    expect(peeps.length).to.equal(2);
    const previous = await People.remove(charlie.dbPath); // removed with full path
    peeps = await People.getAll();
    expect(peeps.length).to.equal(1);
    expect(previous).to.equal(undefined);

    await People.remove(bob.id); // removed with just the 'id'
    peeps = await People.getAll();
    expect(peeps.length).to.equal(0);
  });

  it.skip("Model.updateWhere() works");
});
