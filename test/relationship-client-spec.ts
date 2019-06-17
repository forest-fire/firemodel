// tslint:disable:no-implicit-dependencies
import { Record, IFmRecordEvent } from "../src";
import { DB } from "abstracted-client";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { FireModel } from "../src/FireModel";
import { FancyPerson } from "./testing/FancyPerson";
import { FmEvents } from "../src/state-mgmt";
import { List } from "../src/List";
import { Company } from "./testing/Company";

const addFatherAndChildren = async () => {
  const bob = await Record.add(FancyPerson, {
    name: "Bob",
    age: 23
  });

  const chrissy = await Record.add(FancyPerson, {
    name: "Chrissy",
    age: 18
  });
  const father = await Record.add(FancyPerson, {
    name: "Pops",
    age: 46
  });
  const events: IFmRecordEvent[] = [];
  Record.dispatch = (evt: IFmRecordEvent) => events.push(evt);
  await father.addToRelationship("children", [bob.id, chrissy.id]);

  return {
    fatherId: father.id,
    bobId: bob.id,
    chrissyId: chrissy.id,
    events
  };
};

describe("Relationship > ", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
    FireModel.defaultDb = db;
    FireModel.dispatch = null;
  });

  it("can instantiate a model which has circular relationships", async () => {
    const person = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23
    });
    expect(typeof person).to.equal("object");
    expect(person.data.age).to.equal(23);
  });

  it("using addToRelationship() to relationship with inverse (M:1)", async () => {
    const person = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23
    });
    expect(person.id).to.exist.and.to.be.a("string");
    const lastUpdated = person.data.lastUpdated;
    const events: IFmRecordEvent[] = [];
    Record.dispatch = (evt: IFmRecordEvent) => events.push(evt);

    await person.addToRelationship("cars", "car12345");

    expect((person.data.cars as any)["car12345"]).to.equal(true);
    expect(events).to.have.lengthOf(2);

    const eventTypes = new Set(events.map(e => e.type));
    expect(eventTypes.has(FmEvents.RELATIONSHIP_ADDED_LOCALLY)).to.equal(true);
    expect(eventTypes.has(FmEvents.RELATIONSHIP_ADDED_CONFIRMATION)).to.equal(
      true
    );
    const localEvent = events.find(
      i => i.type === FmEvents.RELATIONSHIP_ADDED_LOCALLY
    );

    expect(localEvent.paths).to.have.lengthOf(4);
    const paths = localEvent.paths.map(i => i.path);
    expect(paths.filter(i => i.includes("car-offset"))).to.have.lengthOf(2);
    expect(paths.filter(i => i.includes("fancyPeople"))).to.have.lengthOf(2);

    expect(paths).to.include("car-offset/cars/car12345/lastUpdated");
    expect(paths).to.include("car-offset/cars/car12345/owner");

    // last updated has changed since relationship added
    expect(person.data.lastUpdated).to.be.greaterThan(lastUpdated);
  });

  it("using addToRelationship() to relationship with inverse (M:M)", async () => {
    const bob = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23
    });
    const father = await Record.add(FancyPerson, {
      name: "Pops",
      age: 46
    });
    const events: IFmRecordEvent[] = [];
    Record.dispatch = (evt: IFmRecordEvent) => events.push(evt);
    await bob.addToRelationship("parents", father.id);
    // local person record is updated
    expect(bob.data.parents[father.id]).to.equal(true);
    const localEvent = events.find(
      i => i.type === FmEvents.RELATIONSHIP_ADDED_LOCALLY
    );
    // client event paths are numerically correct
    expect(localEvent.paths).to.have.lengthOf(4);
    // father record is updated too
    const pops = await Record.get(FancyPerson, father.id);

    expect(pops.data.children[bob.id]).to.equal(true);
  });

  it("using addToRelationship() to add multiple relationships with inverse (M:M)", async () => {
    const results = await addFatherAndChildren();

    const pops = await Record.get(FancyPerson, results.fatherId);
    expect((pops.data.children as any)[results.bobId]).to.equal(true);
    expect((pops.data.children as any)[results.chrissyId]).to.equal(true);

    const bob2 = await Record.get(FancyPerson, results.bobId);
    expect((bob2.data.parents as any)[results.fatherId]).to.equal(true);
  });

  it("using removeFromRelationship() works with inverse (M:M)", async () => {
    const results = await addFatherAndChildren();
    const father = await Record.get(FancyPerson, results.fatherId);
    await father.removeFromRelationship("children", results.bobId);
    const pops = await Record.get(FancyPerson, results.fatherId);
    expect(pops.data.children).to.haveOwnProperty(results.chrissyId);
    expect(pops.data.children).to.not.haveOwnProperty(results.bobId);
  });

  it("using addToRelationship() on a hasOne prop throws error", async () => {
    const bob = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23
    });
    try {
      await bob.addToRelationship("employer", "4567");
    } catch (e) {
      expect(e.name).to.equal("firemodel/not-hasMany-reln");
    }
  });

  it("using setRelationship() on an hasOne prop sets relationship", async () => {
    // TODO: add in an inverse relationship; currently getting very odd decorator behavior
    let bob = await Record.add(FancyPerson, {
      id: "bobs-yur-uncle",
      name: "Bob",
      age: 23
    });
    const abc = await Record.add(Company, {
      id: "e8899",
      name: "ABC Inc"
    });
    const dbWasUpdated = bob.setRelationship("employer", "e8899");
    // locally changed immediately
    expect(bob.get("employer")).to.equal("e8899");
    await dbWasUpdated;
    // also changed in DB after the wait
    bob = await Record.get(FancyPerson, "bobs-yur-uncle");
    expect(bob.get("employer")).to.equal("e8899");
    const people = await List.all(FancyPerson);
    const bob2 = people.findById(bob.id);
    expect(bob2.get("employer")).to.equal("e8899");
    const company = await Record.get(Company, "e8899");
  });

  it("using clearRelationship() on an hasOne prop sets relationship", async () => {
    const bob = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23
    });
    await bob.setRelationship("employer", "e8899");
    expect(bob.get("employer")).to.equal("e8899");
    await bob.clearRelationship("employer");

    expect(bob.get("employer")).to.equal("e8899");
  });
});
