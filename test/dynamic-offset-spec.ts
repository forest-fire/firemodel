import {
  FireModel,
  FmEvents,
  IReduxAction,
  List,
  Mock,
  Record,
  Watch,
} from "@/index";
import { IAbstractedDatabase, IRealTimeAdmin, RealTimeAdmin } from "universal-fire";
import { firstKey, firstRecord, lastRecord } from "./testing/helpers";

import Company from "./testing/dynamicPaths/Company";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";
import Hobby from "./testing/dynamicPaths/Hobby";
import { HumanAttribute } from "./testing/dynamicPaths/HumanAttribute";
import { IDictionary } from "common-types";

describe("Dynamic offsets reflected in path", () => {
  let db: IAbstractedDatabase;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("A single dynamic offset is added to dynamic offset", async () => {
    const person = await Record.add(DeepPerson, {
      name: {
        first: "Bob",
        last: "Marley",
      },
      age: 60,
      group: "foobar",
      phoneNumber: "555-1212",
    });

    expect(person.META.dbOffset).toBe("/group/:group/testing");
    expect(person.dynamicPathComponents).toContain("group");
    expect(person.dbPath).toContain(`${person.data.group}/testing`);
  });

  it("Multiple dynamic offsets are included in dbPath", async () => {
    const person = await Record.add(DeeperPerson, {
      name: {
        first: "Bob",
        last: "Marley",
      },
      age: 60,
      group: "foo",
      subGroup: "bar",
      phoneNumber: "555-1212",
    });

    expect(person.META.dbOffset).toBe(":group/:subGroup/testing");
    expect(person.dynamicPathComponents).toContain("subGroup");
    expect(person.dbPath).toContain(
      `${person.data.group}/${person.data.subGroup}/testing`
    );
  });

  it("Multiple dynamic offsets are used to set and get the correct path in the DB", async () => {
    const person = await Record.add(DeeperPerson, {
      name: {
        first: "Bob",
        last: "Marley",
      },
      age: 60,
      group: "foo",
      subGroup: "bar",
      phoneNumber: "555-1212",
    });

    expect(db.mock.db.foo.bar.testing).toBeInstanceOf(Object);
    const pathToRecord = db.mock.db.foo.bar.testing.deeperPeople[person.id];
    expect(pathToRecord).toBeInstanceOf(Object);
    expect(pathToRecord.age).toBe(person.data.age);

    const p2 = await Record.get(DeeperPerson, {
      id: person.id,
      group: person.data.group,
      subGroup: person.data.subGroup,
    });

    expect(p2.id).toBe(person.id);
    expect(p2.data.age).toBe(person.data.age);
  });
});

describe("Dynamic offsets work with relationships", () => {
  let person: Record<DeepPerson>;
  let db: IAbstractedDatabase;
  let hobbies: List<Hobby>;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });

    FireModel.defaultDb = db;
    person = await Record.add(DeepPerson, {
      name: {
        first: "Joe",
        last: "Blow",
      },
      age: 30,
      group: "test",
      phoneNumber: "555-1234",
    });
    await Mock(Hobby, db).generate(4);
    hobbies = await List.all(Hobby);
  });

  it("addToRelationship works for M:M (where FK is without dynamic segment)", async () => {
    await person.addToRelationship("hobbies", hobbies.data[0].id);
    // FK reference should be standard ID key
    expect(person.data.hobbies).toHaveProperty(hobbies.data[0].id);
    const hobby = await Record.get(Hobby, hobbies.data[0].id);
    // FK model should have composite key pointing back to DeepPerson
    expect(firstKey(hobby.data.practitioners)).toBe(`${person.id}::group:test`);
  });

  it("addToRelationship works for M:M (FK has shared dynamic segment; using implicit composite key)", async () => {
    const motherId = (
      await Mock(DeepPerson).generate(1, {
        age: 55,
        group: "test",
      })
    ).pop();
    const fatherId = (
      await Mock(DeepPerson).generate(1, {
        age: 61,
        group: "test",
      })
    ).pop();

    await person.addToRelationship("parents", [
      motherId.compositeKey,
      fatherId.compositeKey,
    ]);
  });

  it("addToRelationshipo works for M:M (FK has shared dynamic segment; using explicit composite key)", async () => {
    const motherId = (
      await Mock(DeepPerson).generate(1, {
        age: 55,
        group: "test",
      })
    ).pop();
    const fatherId = (
      await Mock(DeepPerson).generate(1, {
        age: 61,
        group: "test",
      })
    ).pop();
    let mother = await Record.get(DeepPerson, {
      id: motherId.id,
      group: "test",
    });
    let father = await Record.get(DeepPerson, {
      id: fatherId.id,
      group: "test",
    });

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey,
    ]);

    // refresh records
    person = await Record.get(DeepPerson, `${person.id}::group:test`);
    mother = await Record.get(DeepPerson, mother.compositeKey);
    father = await Record.get(DeepPerson, father.compositeKey);

    // test
    expect(person.data.parents).toHaveProperty(mother.compositeKeyRef);
    expect(person.data.parents).toHaveProperty(father.compositeKeyRef);

    expect(mother.data.children).toHaveProperty(person.compositeKeyRef);
    expect(father.data.children).toHaveProperty(person.compositeKeyRef);
  });

  it("addToRelationshipo works for M:M (FK has different dynamic segment; using explicit composite key)", async () => {
    const motherId = (
      await Mock(DeepPerson).generate(1, {
        age: 55,
        group: "test",
      })
    ).pop();
    const fatherId = (
      await Mock(DeepPerson).generate(1, {
        age: 61,
        group: "test",
      })
    ).pop();
    let mother = await Record.get(DeepPerson, `${motherId.id}::group:test2`);
    let father = await Record.get(DeepPerson, `${fatherId.id}::group:test2`);

    // add reln
    await person.addToRelationship("parents", [
      mother.compositeKey,
      father.compositeKey,
    ]);

    // refresh records
    person = await Record.get(DeepPerson, `${person.id}::group:test`);
    mother = await Record.get(DeepPerson, mother.compositeKey);
    father = await Record.get(DeepPerson, father.compositeKey);

    // test
    expect(person.data.parents).toHaveProperty(mother.compositeKeyRef);
    expect(person.data.parents).toHaveProperty(father.compositeKeyRef);

    expect(mother.data.children).toHaveProperty(person.compositeKeyRef);
    expect(father.data.children).toHaveProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is on same dynamic path)", async () => {
    let company = await Record.add(Company, {
      name: "acme",
      state: "CA",
      group: "test",
      employees: {},
    });
    person.setRelationship("employer", company.compositeKeyRef);

    company = await Record.get(Company, company.compositeKey);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.employer).toBe(company.compositeKeyRef);
    expect(company.data.employees).toHaveProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is on different dynamic path)", async () => {
    let company = await Record.add(Company, {
      name: "acme",
      state: "CA",
      group: "test2",
      employees: {},
    });
    person.setRelationship("employer", company.compositeKeyRef);

    company = await Record.get(Company, company.compositeKeyRef);
    person = await Record.get(DeepPerson, person.compositeKeyRef);

    expect(person.data.employer).toBe(company.compositeKeyRef);
    expect(company.data.employees).toHaveProperty(person.compositeKeyRef);
  });

  it("setRelationship works for 1:M (where FK is not on a dynamic path)", async () => {
    let attribute = await Record.add(HumanAttribute, {
      attribute: "smart",
      category: "abc",
    });
    person.addToRelationship("attributes", attribute.compositeKeyRef);

    attribute = await Record.get(HumanAttribute, attribute.compositeKeyRef);
    person = await Record.get(DeepPerson, person.compositeKey);

    expect(person.data.attributes).toHaveProperty(attribute.compositeKeyRef);
  });
});

describe("LIST uses static offsets() with static API methods", () => {
  let db: IAbstractedDatabase;
  beforeAll(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
    db.mock.updateDB({});
  });

  it("List.all works with offsets", async () => {
    await Mock(DeepPerson).generate(3, { group: "test" });
    await Mock(DeepPerson).generate(5, { group: "test2" });
    await Mock(DeepPerson).generate(5, { group: "test3" });

    const people = await List.all(DeepPerson, { offsets: { group: "test" } });
    expect(people.length).toBe(3);
  });

  it("List.where works with offsets", async () => {
    await Mock(DeepPerson).generate(3, { group: "test", age: 32 });
    await Mock(DeepPerson).generate(6, { group: "test", age: 45 });
    await Mock(DeepPerson).generate(5, { group: "test2", age: 45 });

    const people = await List.where(DeepPerson, "age", 45, {
      offsets: { group: "test" },
    });

    expect(people.length).toEqual(6);
    expect(people.filter((i) => i.age === 45)).toHaveLength(6);
  });
});

describe("MOCK uses dynamic dbOffsets", () => {
  let db: IAbstractedDatabase;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("Mock() by default does not build out relationships", async () => {
    const results = await Mock(DeepPerson).generate(2, { group: "test" });
    const first = firstRecord(db.mock.db.group.test.testing.deepPeople);
    const last = lastRecord(db.mock.db.group.test.testing.deepPeople);
    expect(first.hobbies).toBeInstanceOf(Object);
    expect(Object.keys(first.hobbies)).toHaveLength(0);
    expect(last.hobbies).toBeInstanceOf(Object);
    expect(Object.keys(last.hobbies)).toHaveLength(0);
  });

  it("Mock() with 'createRelationshipLinks' adds fks but records it points does not exist", async () => {
    const results = await Mock(DeepPerson)
      .createRelationshipLinks()
      .generate(2, { group: "test" });

    const first = firstRecord(db.mock.db.group.test.testing.deepPeople);
    const last = lastRecord(db.mock.db.group.test.testing.deepPeople);
    expect(first.hobbies).toBeInstanceOf(Object);
    expect(Object.keys(first.hobbies)).toHaveLength(2);
    expect(last.hobbies).toBeInstanceOf(Object);
    expect(Object.keys(last.hobbies)).toHaveLength(2);
  });

  it("Mock() generates mocks on dynamic path", async () => {
    await Mock(DeepPerson)
      .followRelationshipLinks()
      .generate(2, { group: "test" });
    expect(db.mock.db.group.test.testing.deepPeople).toBeInstanceOf(Object);
    expect(db.mock.db.hobbies).toBeInstanceOf(Object);
    expect(db.mock.db.attributes).toBeInstanceOf(Object);
    const attributeKey = firstKey(db.mock.db.attributes);
    const attributes = db.mock.db.attributes[attributeKey].humanAttributes;
    const firstAttribute = attributes[firstKey(attributes)];
    expect(firstAttribute.hasOwnProperty("attribute")).toBeTruthy();
    expect(db.mock.db.test.testing.companies).toBeInstanceOf(Object);
  });

  it("Mock() mocks on dynamic path without relationships rendered", async () => {
    await Mock(DeepPerson).generate(2, { group: "test" });
    expect(
      firstRecord<DeepPerson>(db.mock.db.group.test.testing.deepPeople).age
    ).toBeNumber();
    fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);
  });

  it("Mock() mocks on dynamic path and creates appropriate FK with using createRelationshipLinks()", async () => {
    await Mock(DeepPerson)
      .createRelationshipLinks()
      .generate(2, { group: "test" });
    fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);
  });

  it("Mock() mocks on dynamic path and creates appropriate FK bi-directionally with using followRelationshipLinks()", async () => {
    await Mock(DeepPerson)
      .followRelationshipLinks()
      .generate(2, { group: "test" });
    // basics
    expect(db.mock.db.group.test.testing.deepPeople).toBeObject();
    expect(db.mock.db.hobbies).toBeObject();
    expect(db.mock.db.test.testing.companies).toBeObject();
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
      expect(e.code).toBe("mock-not-ready");
    }
  });
});

describe("WATCHers work with dynamic dbOffsets", () => {
  beforeEach(async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
  });

  afterEach(async () => {
    FireModel.defaultDb.remove("/group", true);
  });

  it("Watching a RECORD with a dbOffset works", async () => {
    const events: IReduxAction[] = [];
    const dispatch = async (evt: IReduxAction) => {
      events.push(evt);
    };
    FireModel.dispatch = dispatch;
    const watchRecord = Watch.record(DeepPerson, {
      id: "12345",
      group: "CA",
    });

    expect(watchRecord.start).toBeInstanceOf(Function);
    expect(watchRecord.dispatch).toBeInstanceOf(Function);

    const watcher = await watchRecord.start();

    expect(watcher).toHaveProperty("watcherId");
    expect(watcher.watcherSource).toBe("record");
    expect(watcher.eventFamily).toBe("value");
    expect(watcher.watcherPaths[0]).toBe("/group/CA/testing/deepPeople/12345");
    const person = await Record.add(DeepPerson, {
      id: "12345",
      group: "CA",
      age: 23,
      name: { first: "Charlie", last: "Chaplin" },
    });

    expect(events.map((i) => i.type)).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_CONFIRMATION])
    );
  });

  it("Watching a LIST with a dbOffset works", async () => {
    const events: IReduxAction[] = [];
    const dispatch = async (evt: IReduxAction) => {
      events.push(evt);
    };
    FireModel.dispatch = dispatch;

    const watchList = Watch.list(DeepPerson).offsets({ group: "CA" });

    expect(watchList.start).toBeInstanceOf(Function);
    expect(watchList.all).toBeInstanceOf(Function);
    expect(watchList.where).toBeInstanceOf(Function);
    expect(watchList.since).toBeInstanceOf(Function);
    expect(watchList.recent).toBeInstanceOf(Function);
    expect(watchList.before).toBeInstanceOf(Function);
    expect(watchList.after).toBeInstanceOf(Function);

    const watcher = await watchList.all().start();

    expect(watcher).toHaveProperty("watcherId");
    expect(watcher).toBeObject();

    await Record.add(DeepPerson, {
      name: { first: "Robert", last: "Kennedy" },
      age: 55,
      group: "CA",
    });

    expect(events.map((i) => i.type)).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_CONFIRMATION])
    );
  });
});

function fkStructuralChecksForHasMany(person: IDictionary<DeepPerson>) {
  expect(firstRecord<DeepPerson>(person).hobbies).toBeInstanceOf(Object);
  expect(firstRecord<DeepPerson>(person).parents).toBeInstanceOf(Object);
  expect(firstRecord<DeepPerson>(person).attributes).toBeInstanceOf(Object);
}

function fkPropertyStructureForHasOne<T>(
  record: IDictionary<T>,
  props: Array<keyof T>,
  withDynamicPath: boolean
) {
  props.forEach((prop) => {
    const firstFk = firstRecord<T>(record)[prop];
    const lastFk = lastRecord<T>(record)[prop];
    const fks = [firstFk, lastFk].filter((i) => i);

    fks.forEach((fk) => {
      expect(fk).toBeString();
      if (withDynamicPath) {
        expect(fk).toContain("::");
      } else {
        expect(fk).not.toContain("::");
      }
    });
  });
}

function fkPropertyStructureForHasMany<T>(
  record: IDictionary<T>,
  props: Array<keyof T>,
  withDynamicPath: boolean
) {
  props.forEach((prop) => {
    const firstFk = firstRecord<T>(record)[prop];
    const lastFk = lastRecord<T>(record)[prop];
    const fks = [firstFk, lastFk].filter((i) => i).map((i) => firstKey(i));

    fks.forEach((fk) => {
      expect(fk).toBeString();
      if (withDynamicPath) {
        expect(fk).toContain("::");
      } else {
        expect(fk).not.toContain("::");
      }
    });
  });
}
