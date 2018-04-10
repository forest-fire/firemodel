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
    db.mock.queueSchema("person", 10).generate();
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
    await db.set<Person>("/authenticated/people/1234", {
      name: "Bart Simpson",
      age: 10
    });
    const bart = await Record.get(Person, "1234", { db });
    const backThen = bart.data.createdAt;
    expect(bart.data.lastUpdated).to.equal(backThen);
    const pk = await bart.pushKey("tags", "doh!");
    const result = await Record.get(Person, "1234", { db });

    expect(result.data.tags[pk]).to.equal("doh!");
    expect(result.data.lastUpdated).to.not.equal(backThen);
    expect(result.data.createdAt).to.equal(backThen);
  });

  it("calling dbPath() before the ID is known provides useful error", async () => {
    const record = Record.create(Person, { db });

    try {
      const foo = record.dbPath;
      throw new Error("Error should have happened");
    } catch (e) {
      expect(e.code).to.equal("record/invalid-path");
      expect(e.message).contains("Invalid Record Path");
    }
  });

  it("State of Model's Schema class is not changed due to record information coming in", async () => {
    const record = Record.create(Person, { db });
    const record2 = Record.create(Person, { db });
    expect(record.data).to.not.equal(record2.data);
    expect(record.get("age")).to.equal(undefined);
    expect(record2.get("age")).to.equal(undefined);
    record.initialize({
      name: "Bob",
      age: 12
    });
    expect(record.get("age")).to.equal(12);
    const record3 = Record.create(Person, { db });
    expect(record3.get("age")).to.equal(undefined);
    expect(record2.get("age")).to.equal(undefined);
    expect(record.get("name")).to.equal("Bob");
    expect(record2.get("name")).to.equal(undefined);
  });
});
