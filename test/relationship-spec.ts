// tslint:disable:no-implicit-dependencies
import { Record } from "../src/record";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
// import "reflect-metadata";
import { Person } from "./testing/person";
import { FireModel } from "../src/FireModel";
import { FancyPerson } from "./testing/FancyPerson";
import { IFMRecordEvent, FMEvents } from "../src/state-mgmt";

describe("Relationship > ", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
    FireModel.defaultDb = db;
  });

  it("using addToRelationship() on a hasMany relationship works", async () => {
    const person = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23
    });
    expect(person.id).to.exist.and.to.be.a("string");
    const lastUpdated = person.data.lastUpdated;
    const events: IFMRecordEvent[] = [];
    Record.dispatch = (evt: IFMRecordEvent) => events.push(evt);
    await person.addToRelationship("cars", "12345");
    expect((person.data.cars as any)["12345"]).to.equal(true);
    expect(events).to.have.lengthOf(2);
    const eventTypes = new Set(events.map(e => e.type));
    expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED)).to.equal(true);
    expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED_LOCALLY)).to.equal(true);
  });

  // it.skip("using addToRelationship() on a hasMany relationship with an inverse of hasOne", async () => {
  //   const person = await Record.add(Person, {
  //     name: "Bob",
  //     age: 23
  //   });
  //   expect(person.id).to.exist.and.to.be.a("string");
  //   const lastUpdated = person.data.lastUpdated;
  //   const events: IFMRecordEvent[] = [];
  //   Record.dispatch = (evt: IFMRecordEvent) => events.push(evt);
  //   await person.addToRelationship("concerts", "12345");
  //   expect((person.data.concerts as any)["12345"]).to.equal(true);
  //   expect(events).to.have.lengthOf(2);
  //   const eventTypes = new Set(events.map(e => e.type));
  //   expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED)).to.equal(true);
  //   expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED_LOCALLY)).to.equal(true);
  // });
});
