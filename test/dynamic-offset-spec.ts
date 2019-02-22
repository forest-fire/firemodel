// tslint:disable:no-implicit-dependencies
import { DB } from "abstracted-admin";
import * as chai from "chai";
import { Record, FireModel, Mock, List } from "../src";
import DeepPerson, { IDeepName } from "./testing/dynamicPaths/DeepPerson";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";
import Hobby from "./testing/dynamicPaths/Hobby";
import { firstKey } from "./testing/helpers";
import Company from "./testing/dynamicPaths/Company";
import { HumanAttribute } from "./testing/dynamicPaths/HumanAttribute";

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

describe("Dynamic offsets work with relationships", () => {
  let person: Record<DeepPerson>;
  let db: DB;
  let hobbies: List<Hobby>;
  beforeEach(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
    person = await Record.add(DeepPerson, {
      name: {
        first: "Joe",
        last: "Blow"
      },
      age: 30,
      group: "test",
      phoneNumber: "555-1234"
    });
    await Mock(Hobby, db).generate(4);
    hobbies = await List.all(Hobby);
  });

  it("addToRelationship works for M:M (where FK is without dynamic segment)", async () => {
    await person.addToRelationship("hobbies", hobbies.data[0].id);
    // FK reference should be standard ID key
    expect(person.data.hobbies).to.haveOwnProperty(hobbies.data[0].id);
    const hobby = await Record.get(Hobby, hobbies.data[0].id);
    // FK model should have composite key pointing back to DeepPerson
    expect(firstKey(hobby.data.practitioners)).to.equal(
      `${person.id}::group:test`
    );
  });

  it("addToRelationship works for M:M (FK has shared dynamic segment; using implicit composite key)", async () => {
    const motherId = (await Mock(DeepPerson).generate(1, {
      age: 55,
      group: "test"
    })).pop();
    const fatherId = (await Mock(DeepPerson).generate(1, {
      age: 61,
      group: "test"
    })).pop();

    await person.addToRelationship("parents", [motherId, fatherId]);
  });

  it("addToRelationshipo works for M:M (FK has shared dynamic segment; using explicit composite key)", async () => {
    const motherId = (await Mock(DeepPerson).generate(1, {
      age: 55,
      group: "test"
    })).pop();
    const fatherId = (await Mock(DeepPerson).generate(1, {
      age: 61,
      group: "test"
    })).pop();
    let mother = await Record.get(DeepPerson, {
      id: motherId,
      group: "test"
    });
    let father = await Record.get(DeepPerson, {
      id: fatherId,
      group: "test"
    });

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey
    ]);

    // refresh records
    person = await Record.get(DeepPerson, { id: person.id, group: "test" });
    mother = await Record.get(DeepPerson, mother.compositeKey);
    father = await Record.get(DeepPerson, father.compositeKey);

    // test
    expect(person.data.parents).to.haveOwnProperty(mother.compositeKeyRef);
    expect(person.data.parents).to.haveOwnProperty(father.compositeKeyRef);

    expect(mother.data.children).to.haveOwnProperty(person.compositeKeyRef);
    expect(father.data.children).to.haveOwnProperty(person.compositeKeyRef);
  });

  it("addToRelationshipo works for M:M (FK has different dynamic segment; using explicit composite key)", async () => {
    const motherId = (await Mock(DeepPerson).generate(1, {
      age: 55,
      group: "test"
    })).pop();
    const fatherId = (await Mock(DeepPerson).generate(1, {
      age: 61,
      group: "test"
    })).pop();
    let mother = await Record.get(DeepPerson, {
      id: motherId,
      group: "test2"
    });
    let father = await Record.get(DeepPerson, {
      id: fatherId,
      group: "test2"
    });

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey
    ]);

    // refresh records
    person = await Record.get(DeepPerson, { id: person.id, group: "test" });
    mother = await Record.get(DeepPerson, mother.compositeKey);
    father = await Record.get(DeepPerson, father.compositeKey);

    // test
    expect(person.data.parents).to.haveOwnProperty(mother.compositeKeyRef);
    expect(person.data.parents).to.haveOwnProperty(father.compositeKeyRef);

    expect(mother.data.children).to.haveOwnProperty(person.compositeKeyRef);
    expect(father.data.children).to.haveOwnProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is on same dynamic path)", async () => {
    let company = await Record.add(Company, {
      name: "acme",
      state: "CA",
      group: "test",
      employees: {}
    });
    person.setRelationship("employer", company.compositeKeyRef);

    company = await Record.get(Company, company.compositeKey);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.employer).to.equal(company.compositeKeyRef);
    expect(company.data.employees).to.haveOwnProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is on different dynamic path)", async () => {
    let company = await Record.add(Company, {
      name: "acme",
      state: "CA",
      group: "test2",
      employees: {}
    });
    person.setRelationship("employer", company.compositeKeyRef);

    company = await Record.get(Company, company.compositeKey);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.employer).to.equal(company.compositeKeyRef);
    expect(company.data.employees).to.haveOwnProperty(person.compositeKeyRef);
  });

  it("setRelationship works for M:1 (where FK is not on a dynamic path)", async () => {
    let attribute = await Record.add(HumanAttribute, {
      attribute: "smart"
    });
    person.addToRelationship("attributes", attribute.compositeKeyRef);

    attribute = await Record.get(HumanAttribute, attribute.compositeKey);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.attributes).to.haveOwnProperty(
      attribute.compositeKeyRef
    );
  });
});
