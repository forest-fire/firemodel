// tslint:disable:no-implicit-dependencies
import { Record } from "../src/index";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";
import { FireModel } from "../src/FireModel";

describe("Relationship > ", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
    FireModel.defaultDb = db;
  });

  it("using addHasMany() on a hasMany relationship works", async () => {
    const person = await Record.add(Person, {
      name: "Bob",
      age: 23
    });
    expect(person.id).to.exist.and.to.be.a("string");
    expect(person.data.children).to.be.an("object");
    const lastUpdated = person.data.lastUpdated;
    expect(Object.keys(person.data.children)).to.have.lengthOf(0);
    await person.addHasMany("children", "1234");
    expect(person.data.children["1234"]).to.exist.and.equal(true);
    await person.addHasMany("children", "foobar", "is just a bar");
    expect(person.data.children.foobar).to.exist.and.equal("is just a bar");
    expect(person.data.lastUpdated).to.exist.and.be.greaterThan(lastUpdated);
  });
});
