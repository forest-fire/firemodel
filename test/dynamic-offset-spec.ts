// tslint:disable:no-implicit-dependencies
import { DB } from "abstracted-admin";
import * as chai from "chai";
import { Record, FireModel, Mock, List, Watch, FmEvents } from "../src";
import DeepPerson, { IDeepName } from "./testing/dynamicPaths/DeepPerson";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";
import { MockedPerson } from "./testing/dynamicPaths/MockedPerson";
import { MockedPerson2 } from "./testing/dynamicPaths/MockedPerson2";
import Hobby from "./testing/dynamicPaths/Hobby";
import {
  firstKey,
  firstRecord,
  lastRecord,
  captureStderr,
  captureStdout
} from "./testing/helpers";
import Company from "./testing/dynamicPaths/Company";
import { HumanAttribute } from "./testing/dynamicPaths/HumanAttribute";
import { IDictionary } from "common-types";
import { FancyPerson } from "./testing/FancyPerson";
import { IReduxAction } from "../src/VuexWrapper";

const expect = chai.expect;

describe("Dynamic offsets reflected in path", () => {
  let db: DB;
  beforeEach(async () => {
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

    expect(person.META.dbOffset).to.equal("/group/:group/testing");
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
    const pathToRecord = db.mock.db.foo.bar.testing.deeperPeople[person.id];
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

    await person.addToRelationship("parents", [
      motherId.compositeKey,
      fatherId.compositeKey
    ]);
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
      id: motherId.id,
      group: "test"
    });
    let father = await Record.get(DeepPerson, {
      id: fatherId.id,
      group: "test"
    });

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey
    ]);

    // refresh records
    person = await Record.get(DeepPerson, `${person.id}::group:test`);
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
    let mother = await Record.get(DeepPerson, `${motherId.id}::group:test2`);
    let father = await Record.get(DeepPerson, `${fatherId.id}::group:test2`);

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey
    ]);

    // refresh records
    person = await Record.get(DeepPerson, `${person.id}::group:test`);
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

    company = await Record.get(Company, company.compositeKeyRef);
    person = await Record.get(DeepPerson, person.compositeKeyRef);

    expect(person.data.employer).to.equal(company.compositeKeyRef);
    expect(company.data.employees).to.haveOwnProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is not on a dynamic path)", async () => {
    let attribute = await Record.add(HumanAttribute, {
      attribute: "smart",
      category: "abc"
    });
    person.addToRelationship("attributes", attribute.compositeKeyRef);

    attribute = await Record.get(HumanAttribute, attribute.compositeKeyRef);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.attributes).to.haveOwnProperty(
      attribute.compositeKeyRef
    );
  });
});

describe("LIST uses static offsets() with static API methods", () => {
  let db: DB;
  before(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
    db.mock.updateDB({});
  });

  it.skip("LIST.offsets() returns LIST API", async () => {
    // const api = List.offsets({ geoCode: "1234" });
    // expect(List).to.have.ownProperty("all");
    // expect(List).to.have.ownProperty("where");
  });

  it("List.all works with offsets", async () => {
    await Mock(DeepPerson).generate(3, { group: "test" });
    await Mock(DeepPerson).generate(5, { group: "test2" });
    await Mock(DeepPerson).generate(5, { group: "test3" });

    const people = await List.all(DeepPerson, { offsets: { group: "test" } });
    expect(people.length).to.equal(3);
  });

  it("List.where works with offsets", async () => {
    await Mock(DeepPerson).generate(3, { group: "test", age: 32 });
    await Mock(DeepPerson).generate(6, { group: "test", age: 45 });
    await Mock(DeepPerson).generate(5, { group: "test2", age: 45 });
    const people = await List.where(DeepPerson, "age", 45, {
      offsets: { group: "test" }
    });
    expect(people.length).to.equal(6);
    expect(people.filter(i => i.age === 45)).is.length(6);
  });
});

describe("MOCK uses dynamic dbOffsets", () => {
  let db: DB;
  beforeEach(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("Mock() by default does not build out relationships", async () => {
    const results = await Mock(DeepPerson).generate(2, { group: "test" });
    const first = firstRecord(db.mock.db.group.test.testing.deepPeople);
    const last = lastRecord(db.mock.db.group.test.testing.deepPeople);
    expect(first.hobbies).is.an("object");
    expect(Object.keys(first.hobbies)).to.have.lengthOf(0);
    expect(last.hobbies).is.an("object");
    expect(Object.keys(last.hobbies)).to.have.lengthOf(0);
  });

  it("Mock() with 'createRelationshipLinks' adds fks but records it points does not exist", async () => {
    const results = await Mock(DeepPerson)
      .createRelationshipLinks()
      .generate(2, { group: "test" });

    const first = firstRecord(db.mock.db.group.test.testing.deepPeople);
    const last = lastRecord(db.mock.db.group.test.testing.deepPeople);
    expect(first.hobbies).is.an("object");
    expect(Object.keys(first.hobbies)).to.have.lengthOf(2);
    expect(last.hobbies).is.an("object");
    expect(Object.keys(last.hobbies)).to.have.lengthOf(2);
  });

  it("Mock() generates mocks on dynamic path", async () => {
    await Mock(DeepPerson)
      .followRelationshipLinks()
      .generate(2, { group: "test" });
    expect(db.mock.db.group.test.testing.deepPeople).is.an("object");
    expect(db.mock.db.hobbies).is.an("object");
    expect(db.mock.db.attributes).is.an("object");
    const attributeKey = firstKey(db.mock.db.attributes);
    const attributes = db.mock.db.attributes[attributeKey].humanAttributes;
    const firstAttribute = attributes[firstKey(attributes)];
    expect(firstAttribute).to.have.ownProperty("attribute");
    expect(db.mock.db.test.testing.companies).is.an("object");
  });

  it("Mock() mocks on dynamic path without relationships rendered", async () => {
    await Mock(DeepPerson).generate(2, { group: "test" });
    expect(
      firstRecord<DeepPerson>(db.mock.db.group.test.testing.deepPeople).age
    ).to.be.a("number");
    fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);
  });

  it("Mock() mocks on dynamic path and creates appropriate FK with using createRelationshipLinks()", async () => {
    await Mock(DeepPerson)
      .createRelationshipLinks()
      .generate(2, { group: "test" });
    fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);
  });

  it.only("Mock() mocks on dynamic path and creates appropriate FK bi-directionally with using followRelationshipLinks()", async () => {
    await Mock(DeepPerson)
      .followRelationshipLinks()
      .generate(2, { group: "test" });
    // basics
    expect(db.mock.db.group.test.testing.deepPeople).is.an("object");
    expect(db.mock.db.hobbies).is.an("object");
    // console.log(JSON.stringify(db.mock.db, null, 2));
    expect(db.mock.db.test.testing.companies).is.an("object");
    // FK checks
    fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);

    fkPropertyStructureForHasMany(
      db.mock.db.group.test.testing.deepPeople,
      ["parents", "children", "practitioners"],
      true
    );
    fkPropertyStructureForHasMany(
      db.mock.db.group.test.testing.deepPeople,
      ["hobby"],
      false
    );
    fkPropertyStructureForHasOne(
      db.mock.db.group.test.testing.deepPeople,
      ["employer"],
      true
    );
    fkPropertyStructureForHasOne(
      db.mock.db.group.test.testing.deepPeople,
      ["school"],
      false
    );
  });

  it("Mock() throws an error if dynamic props aren't set", async () => {
    try {
      await Mock(DeeperPerson).generate(3);
      throw new Error("Should have failed");
    } catch (e) {
      expect(e.code).to.equal("mock-not-ready");
    }
  });
});

describe("WATCHers work with dynamic dbOffsets", () => {
  beforeEach(async () => {
    FireModel.defaultDb = await DB.connect({ mocking: true });
  });

  afterEach(async () => {
    FireModel.defaultDb.remove("/group", true);
  });

  it("Watching a RECORD with a dbOffset works", async () => {
    const events: IReduxAction[] = [];
    const dispatch = (evt: IReduxAction) => {
      events.push(evt);
    };
    FireModel.dispatch = dispatch;
    const watchRecord = await Watch.record(DeepPerson, {
      id: "12345",
      group: "CA"
    });

    expect(watchRecord.start).to.be.a("function");
    expect(watchRecord.dispatch).to.be.a("function");

    const watcher = await watchRecord.start();

    expect(watcher).to.haveOwnProperty("watcherId");
    expect(watcher.watcherSource).to.equal("record");
    expect(watcher.eventType).to.equal("value");
    expect(watcher.dbPath).to.equal("/group/CA/testing/deepPeople/12345");
    const person = await Record.add(DeepPerson, {
      id: "12345",
      group: "CA",
      age: 23,
      name: { first: "Charlie", last: "Chaplin" }
    });

    expect(events.map(i => i.type)).to.include(
      FmEvents.RECORD_ADDED_CONFIRMATION
    );
  });

  it("Watching a LIST with a dbOffset works", async () => {
    const events: IReduxAction[] = [];
    const dispatch = (evt: IReduxAction) => {
      events.push(evt);
    };
    FireModel.dispatch = dispatch;

    const watchList = Watch.list(DeepPerson).offsets({ group: "CA" });

    expect(watchList.start).to.be.a("function");
    expect(watchList.all).to.be.a("function");
    expect(watchList.where).to.be.a("function");
    expect(watchList.since).to.be.a("function");
    expect(watchList.recent).to.be.a("function");
    expect(watchList.before).to.be.a("function");
    expect(watchList.after).to.be.a("function");

    const watcher = await watchList.all().start();

    expect(watcher)
      .to.haveOwnProperty("watcherId")
      .and.to.be.a("string");

    await Record.add(DeepPerson, {
      name: { first: "Robert", last: "Kennedy" },
      age: 55,
      group: "CA"
    });

    expect(events.map(i => i.type)).to.include(
      FmEvents.RECORD_ADDED_CONFIRMATION
    );
  });
});

function fkStructuralChecksForHasMany(person: IDictionary<DeepPerson>) {
  expect(firstRecord<DeepPerson>(person).hobbies).is.an("object");
  expect(firstRecord<DeepPerson>(person).parents).is.an("object");
  expect(firstRecord<DeepPerson>(person).attributes).is.an("object");
}

function fkPropertyStructureForHasOne<T>(
  record: IDictionary<T>,
  props: Array<keyof T>,
  withDynamicPath: boolean
) {
  props.forEach(prop => {
    const firstFk = firstRecord<T>(record)[prop];
    const lastFk = lastRecord<T>(record)[prop];
    const fks = [firstFk, lastFk].filter(i => i);

    fks.forEach(fk => {
      expect(fk).to.be.a("string");
      if (withDynamicPath) {
        expect(fk).to.include("::");
      } else {
        expect(fk).to.not.include("::");
      }
    });
  });
}

function fkPropertyStructureForHasMany<T>(
  record: IDictionary<T>,
  props: Array<keyof T>,
  withDynamicPath: boolean
) {
  props.forEach(prop => {
    const firstFk = firstRecord<T>(record)[prop];
    const lastFk = lastRecord<T>(record)[prop];
    const fks = [firstFk, lastFk].filter(i => i).map(i => firstKey(i));

    fks.forEach(fk => {
      expect(fk).to.be.a("string");
      if (withDynamicPath) {
        expect(fk).to.include("::");
      } else {
        expect(fk).to.not.include("::");
      }
    });
  });
}
