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
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
import "reflect-metadata";
import { Klass, ContainedKlass, SubKlass } from "./testing/klass";
import { Person } from "./testing/person";
import { Company } from "./testing/company";

describe("Record > ", () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
    db.resetMockDb();
    db.mock
      .addSchema("person", h => () => ({
        name: h.faker.name.firstName(),
        age: h.faker.random.number({ min: 1, max: 99 })
      }))
      .pathPrefix("authenticated");
  });

  it("using pushKey works", async () => {
    db.set<Person>("/authenticated/people/1234", {
      name: "Bart Simpson",
      age: 10
    });
    const People = new Model<Person>(Person, db);
    let bart = await People.getRecord("1234");
    await bart.pushKey("tags", "doh!");
    bart = await People.getRecord("1234");
    const first = helpers.firstKey(bart.data.tags);
    expect(bart.data.tags[first]).to.equal("doh!");
  });

  it("using pushKey updates lastUpdated", async () => {
    db.set<Person>("/authenticated/people/1234", {
      name: "Bart Simpson",
      age: 10
    });
    const People = new Model<Person>(Person, db);
    let bart = await People.getRecord("1234");
    const backThen = bart.data.createdAt;
    expect(bart.data.lastUpdated).to.equal(backThen);
    await bart.pushKey("tags", "doh!");
    bart = await People.getRecord("1234");
    const first = helpers.firstKey(bart.data.tags);
    expect(bart.data.tags[first]).to.equal("doh!");
    expect(bart.data.lastUpdated).to.not.equal(backThen);
    expect(bart.data.createdAt).to.equal(backThen);
  });
});
