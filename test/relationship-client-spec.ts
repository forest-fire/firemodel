import "reflect-metadata";

import { IFmLocalRelationshipEvent, IFmWatchEvent, Record } from "../src";
import { IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { Company } from "./testing/Company";
import { FancyPerson } from "./testing/FancyPerson";
import { FireModel } from "@/index";
import { FmEvents } from "@/index";
import { List } from "@/index";

const addFatherAndChildren = async () => {
  const bob = await Record.add(FancyPerson, {
    name: "Bob",
    age: 23,
  });

  const chrissy = await Record.add(FancyPerson, {
    name: "Chrissy",
    age: 18,
  });
  const father = await Record.add(FancyPerson, {
    name: "Pops",
    age: 46,
  });
  const events: IFmWatchEvent[] = [];
  Record.dispatch = async (evt: IFmWatchEvent) => events.push(evt);
  await father.addToRelationship("children", [bob.id, chrissy.id]);

  return {
    fatherId: father.id,
    bobId: bob.id,
    chrissyId: chrissy.id,
    events,
  };
};

describe("Relationship > ", () => {
  beforeEach(async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({ mocking: true });;
    FireModel.dispatch = null;
  });

  it("can instantiate a model which has circular relationships", async () => {
    const person = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23,
    });
    expect(typeof person).toBe("object");
    expect(person.data.age).toBe(23);
  });

  it("using addToRelationship() to relationship with inverse (M:1)", async () => {
    const person = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23,
    });
    expect(person.id).toBeDefined();
    expect(person.id).toBeString();
    const lastUpdated = person.data.lastUpdated;
    const events: IFmLocalRelationshipEvent[] = [];
    Record.dispatch = async (evt: IFmLocalRelationshipEvent) =>
      events.push(evt);

    await person.addToRelationship("cars", "car12345");

    expect((person.data.cars as any)["car12345"]).toBe(true);
    expect(events).toHaveLength(2);

    const eventTypes = new Set(events.map((e) => e.type));
    expect(eventTypes.has(FmEvents.RELATIONSHIP_ADDED_LOCALLY)).toBe(true);
    expect(eventTypes.has(FmEvents.RELATIONSHIP_ADDED_CONFIRMATION)).toBe(true);
    const localEvent = events.find(
      (i) => i.type === FmEvents.RELATIONSHIP_ADDED_LOCALLY
    );

    expect(localEvent.paths).toHaveLength(4);
    const paths = localEvent.paths.map((i) => i.path);
    expect(paths.filter((i) => i.includes("car-offset"))).toHaveLength(2);
    expect(paths.filter((i) => i.includes("fancyPeople"))).toHaveLength(2);

    expect(paths).toEqual(
      expect.arrayContaining(["car-offset/cars/car12345/lastUpdated"])
    );
    expect(paths).toEqual(
      expect.arrayContaining(["car-offset/cars/car12345/owner"])
    );

    // last updated has changed since relationship added
    expect(person.data.lastUpdated).toBeGreaterThan(lastUpdated);
  });

  it("using addToRelationship() to relationship with inverse (M:M)", async () => {
    const bob = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23,
    });
    const father = await Record.add(FancyPerson, {
      name: "Pops",
      age: 46,
    });
    const events: IFmLocalRelationshipEvent[] = [];
    Record.dispatch = async (evt: IFmLocalRelationshipEvent) =>
      events.push(evt);
    await bob.addToRelationship("parents", father.id);
    // local person record is updated
    expect(bob.data.parents[father.id]).toBe(true);
    const localEvent = events.find(
      (i) => i.type === FmEvents.RELATIONSHIP_ADDED_LOCALLY
    );
    // client event paths are numerically correct
    expect(localEvent.paths).toHaveLength(4);
    // father record is updated too
    const pops = await Record.get(FancyPerson, father.id);

    expect(pops.data.children[bob.id]).toBe(true);
  });

  it("using addToRelationship() to add multiple relationships with inverse (M:M)", async () => {
    const results = await addFatherAndChildren();

    const pops = await Record.get(FancyPerson, results.fatherId);
    expect((pops.data.children as any)[results.bobId]).toBe(true);
    expect((pops.data.children as any)[results.chrissyId]).toBe(true);

    const bob2 = await Record.get(FancyPerson, results.bobId);
    expect((bob2.data.parents as any)[results.fatherId]).toBe(true);
  });

  it("using removeFromRelationship() works with inverse (M:M)", async () => {
    const results = await addFatherAndChildren();
    const father = await Record.get(FancyPerson, results.fatherId);
    await father.removeFromRelationship("children", results.bobId);
    const pops = await Record.get(FancyPerson, results.fatherId);
    expect(pops.data.children).toHaveProperty(results.chrissyId);
    expect(pops.data.children).not.toHaveProperty(results.bobId);
  });

  it("using addToRelationship() on a hasOne prop throws error", async () => {
    const bob = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23,
    });
    try {
      await bob.addToRelationship("employer", "4567");
    } catch (e) {
      expect(e.name).toBe("firemodel/not-hasMany-reln");
    }
  });

  it("using setRelationship() on an hasOne prop sets relationship", async () => {
    // TODO: add in an inverse relationship; currently getting very odd decorator behavior
    let bob = await Record.add(FancyPerson, {
      id: "bobs-yur-uncle",
      name: "Bob",
      age: 23,
    });
    const abc = await Record.add(Company, {
      id: "e8899",
      name: "ABC Inc",
    });
    const dbWasUpdated = bob.setRelationship("employer", "e8899");
    // locally changed immediately
    expect(bob.get("employer")).toBe("e8899");
    await dbWasUpdated;
    // also changed in DB after the wait
    bob = await Record.get(FancyPerson, "bobs-yur-uncle");
    expect(bob.get("employer")).toBe("e8899");
    const people = await List.all(FancyPerson);
    const bob2 = people.getRecord(bob.id);
    people.get("1234");
    expect(bob2.get("employer")).toBe("e8899");
    const company = await Record.get(Company, "e8899");
  });

  it("using clearRelationship() on an hasOne prop sets relationship", async () => {
    const bob = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23,
    });
    await bob.setRelationship("employer", "e8899");
    expect(bob.get("employer")).toBe("e8899");
    await bob.clearRelationship("employer");

    expect(bob.get("employer")).toBe("e8899");
  });
});
