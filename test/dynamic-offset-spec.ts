// tslint:disable:no-implicit-dependencies
import { DB } from "abstracted-admin";
import * as chai from "chai";
import { Record, FireModel } from "../src";
import { DeepPerson } from "./testing/DeepPerson";
import { DeeperPerson } from "./testing/DeeperPerson";

const expect = chai.expect;

describe("Dynamic offsets reflected in path", () => {
  let db: DB;
  before(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("A single dynamic offset is added to dynamic offset", async () => {
    const person = await Record.add(DeepPerson, {
      name: {
        first: "Bob",
        last: "Marley"
      },
      age: 60,
      group: "foobar",
      phoneNumber: "555-1212"
    });

    expect(person.META.dbOffset).to.equal(":group/testing");
    expect(person.dynamicPathComponents)
      .to.be.lengthOf(1)
      .and.contain("group");
    expect(person.dbPath).to.contain(`${person.data.group}/testing`);
  });

  it("Multiple dynamic offsets are included in dbPath", async () => {
    const person = await Record.add(DeeperPerson, {
      name: {
        first: "Bob",
        last: "Marley"
      },
      age: 60,
      group: "foo",
      subGroup: "bar",
      phoneNumber: "555-1212"
    });

    expect(person.META.dbOffset).to.equal(":group/:subGroup/testing");
    expect(person.dynamicPathComponents)
      .to.be.lengthOf(2)
      .and.contain("group")
      .and.contain("subGroup");
    expect(person.dbPath).to.contain(
      `${person.data.group}/${person.data.subGroup}/testing`
    );
  });

  it("Multiple dynamic offsets are used to set and get the correct path in the DB", async () => {
    const person = await Record.add(DeeperPerson, {
      name: {
        first: "Bob",
        last: "Marley"
      },
      age: 60,
      group: "foo",
      subGroup: "bar",
      phoneNumber: "555-1212"
    });

    expect(db.mock.db.foo.bar.testing).to.be.an("object");
    const pathToRecord = db.mock.db.foo.bar.testing.deeperpeople[person.id];
    expect(pathToRecord).to.be.an("object");
    expect(pathToRecord.age).to.equal(person.data.age);

    const p2 = await Record.get(DeeperPerson, {
      id: person.id,
      group: person.data.group,
      subGroup: person.data.subGroup
    });

    expect(p2.id).to.equal(person.id);
    expect(p2.data.age).to.equal(person.data.age);
  });
});
