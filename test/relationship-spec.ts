// tslint:disable:no-implicit-dependencies
import { Record } from "../src";
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
    db.mock.updateDB({});
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
    });

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male"
    });

    const pay = await Record.add(Pay, {
      amount: "2400.00"
    });

    await company.addToRelationship("employees", person.id);
    await person.addToRelationship("pays", pay.id);

    expect((company.data.employees as any)[person.id]).to.equal(true);
  });

  it("testing adding relationships with associate", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992"
    });

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male"
    });

    const person2 = await Record.add(Person, {
      name: "Jane Bloggs",
      age: 24,
      gender: "female"
    });

    const pay = await Record.add(Pay, {
      amount: "2400.00"
    });

    await company.associate("employees", person.id);
    await person.associate("pays", pay.id);
    await company.addToRelationship("employees", [person.id, person2.id]);
    await company.associate("employees", [person.id, person2.id]);

    expect((company.data.employees as any)[person.id]).to.equal(true);
  });

  it("testing removing relationships with associate", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992"
    });

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male"
    });

    const person2 = await Record.add(Person, {
      name: "Jane Bloggs",
      age: 24,
      gender: "female"
    });

    const pay = await Record.add(Pay, {
      amount: "2400.00"
    });

    await person.associate("pays", pay.id);
    await company.associate("employees", [person.id, person2.id]);

    await company.disassociate("employees", person2.id);
    await person.disassociate("pays", pay.id);

    expect((company.data.employees as any)[person.id]).to.equal(true);
    expect((company.data.employees as any)[person2.id]).to.not.equal(true);
    expect((person.data.pays as any)[pay.id]).to.not.equal(true);
  });

  it("testing it should throw an error when incorrect refs is passed in with associate", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992"
    });

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male"
    });

    try {
      await person.associate("company", [company.id]);
      expect(false, "passing array as refs is not allowed with hasOne!");
    } catch (e) {
      expect(e.message).to.equal(
        "Ref -LYdV5fhRmiGWXwdAWSg must not be an array of strings."
      );
    }
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
}).timeout(4000);
