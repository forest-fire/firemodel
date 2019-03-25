"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const src_1 = require("../src");
const abstracted_admin_1 = require("abstracted-admin");
const chai = __importStar(require("chai"));
const expect = chai.expect;
// import "reflect-metadata";
const person_1 = require("./testing/person");
const FireModel_1 = require("../src/FireModel");
const FancyPerson_1 = require("./testing/FancyPerson");
const state_mgmt_1 = require("../src/state-mgmt");
const Company_1 = require("./testing/Company");
const Pay_1 = require("./testing/Pay");
describe("Relationship > ", () => {
    let db;
    beforeEach(async () => {
        db = new abstracted_admin_1.DB({ mocking: true });
        await db.waitForConnection();
        FireModel_1.FireModel.defaultDb = db;
        db.mock.updateDB({});
    });
    it("using addToRelationship() on a hasMany relationship works", async () => {
        const person = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob",
            age: 23
        });
        expect(person.id).to.exist.and.to.be.a("string");
        const lastUpdated = person.data.lastUpdated;
        const events = [];
        src_1.Record.dispatch = (evt) => events.push(evt);
        await person.addToRelationship("cars", "12345");
        expect(person.data.cars["12345"]).to.equal(true);
        expect(events).to.have.lengthOf(2);
        const eventTypes = new Set(events.map(e => e.type));
        expect(eventTypes.has(state_mgmt_1.FMEvents.RELATIONSHIP_ADDED)).to.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RELATIONSHIP_ADDED_LOCALLY)).to.equal(true);
    });
    it("testing adding relationships", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(person_1.Person, {
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        const pay = await src_1.Record.add(Pay_1.Pay, {
            amount: "2400.00"
        });
        company.addToRelationship("employees", person.id);
        person.addToRelationship("pays", pay.id);
        expect(company.data.employees[person.id]).to.equal(true);
    });
    it("testing adding relationships with associate", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(person_1.Person, {
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        const person2 = await src_1.Record.add(person_1.Person, {
            name: "Jane Bloggs",
            age: 24,
            gender: "female"
        });
        const pay = await src_1.Record.add(Pay_1.Pay, {
            amount: "2400.00"
        });
        company.associate("employees", person.id);
        person.associate("pays", pay.id);
        company.addToRelationship("employees", [person.id, person2.id]);
        company.associate("employees", [person.id, person2.id]);
        expect(company.data.employees[person.id]).to.equal(true);
    });
    it("testing removing relationships with associate", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(person_1.Person, {
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        const person2 = await src_1.Record.add(person_1.Person, {
            name: "Jane Bloggs",
            age: 24,
            gender: "female"
        });
        const pay = await src_1.Record.add(Pay_1.Pay, {
            amount: "2400.00"
        });
        person.associate("pays", pay.id);
        company.associate("employees", [person.id, person2.id]);
        company.disassociate("employees", person2.id);
        person.disassociate("pays", pay.id);
        expect(company.data.employees[person.id]).to.equal(true);
        expect(company.data.employees[person2.id]).to.not.equal(true);
        expect(person.data.pays[pay.id]).to.not.equal(true);
    });
    it("testing it should throw an error when incorrect refs is passed in with associate", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(person_1.Person, {
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        try {
            person.associate("company", [company.id]);
            expect(false, "passing array as refs is not allowed with hasOne!");
        }
        catch (e) {
            expect(e.message).to.equal("Ref -LYdV5fhRmiGWXwdAWSg must not be an array of strings.");
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
//# sourceMappingURL=relationship-spec.js.map