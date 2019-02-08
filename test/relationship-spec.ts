// tslint:disable:no-implicit-dependencies
import { Record } from "../src/Record";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
// import "reflect-metadata";
import { Person } from "./testing/person";
import { FireModel } from "../src/FireModel";
import { FancyPerson } from "./testing/FancyPerson";
import { IFMRecordEvent, FMEvents } from "../src/state-mgmt";
import { Company } from "./testing/Company";
import { Pay } from "./testing/Pay";

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

  it("testing adding relationships", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992"
    })

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male"
    })

    const pay = await Record.add(Pay, {
      amount: "2400.00"
    })

    company.addToRelationship("employees", person.id)
    person.addToRelationship("pays", pay.id)

    expect((company.data.employees as any)[person.id]).to.equal(true)
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
