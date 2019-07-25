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
const abstracted_client_1 = require("abstracted-client");
const chai = __importStar(require("chai"));
const expect = chai.expect;
require("reflect-metadata");
const FireModel_1 = require("../src/FireModel");
const FancyPerson_1 = require("./testing/FancyPerson");
const state_mgmt_1 = require("../src/state-mgmt");
const List_1 = require("../src/List");
const Company_1 = require("./testing/Company");
const addFatherAndChildren = async () => {
    const bob = await src_1.Record.add(FancyPerson_1.FancyPerson, {
        name: "Bob",
        age: 23
    });
    const chrissy = await src_1.Record.add(FancyPerson_1.FancyPerson, {
        name: "Chrissy",
        age: 18
    });
    const father = await src_1.Record.add(FancyPerson_1.FancyPerson, {
        name: "Pops",
        age: 46
    });
    const events = [];
    src_1.Record.dispatch = (evt) => events.push(evt);
    await father.addToRelationship("children", [bob.id, chrissy.id]);
    return {
        fatherId: father.id,
        bobId: bob.id,
        chrissyId: chrissy.id,
        events
    };
};
describe("Relationship > ", () => {
    let db;
    beforeEach(async () => {
        db = new abstracted_client_1.DB({ mocking: true });
        await db.waitForConnection();
        FireModel_1.FireModel.defaultDb = db;
        FireModel_1.FireModel.dispatch = null;
    });
    it("can instantiate a model which has circular relationships", async () => {
        const person = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob",
            age: 23
        });
        expect(typeof person).to.equal("object");
        expect(person.data.age).to.equal(23);
    });
    it("using addToRelationship() to relationship with inverse (M:1)", async () => {
        const person = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob",
            age: 23
        });
        expect(person.id).to.exist.and.to.be.a("string");
        const lastUpdated = person.data.lastUpdated;
        const events = [];
        src_1.Record.dispatch = (evt) => events.push(evt);
        await person.addToRelationship("cars", "car12345");
        expect(person.data.cars["car12345"]).to.equal(true);
        expect(events).to.have.lengthOf(2);
        const eventTypes = new Set(events.map(e => e.type));
        expect(eventTypes.has(state_mgmt_1.FmEvents.RELATIONSHIP_ADDED_LOCALLY)).to.equal(true);
        expect(eventTypes.has(state_mgmt_1.FmEvents.RELATIONSHIP_ADDED_CONFIRMATION)).to.equal(true);
        const localEvent = events.find(i => i.type === state_mgmt_1.FmEvents.RELATIONSHIP_ADDED_LOCALLY);
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
        const bob = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob",
            age: 23
        });
        const father = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Pops",
            age: 46
        });
        const events = [];
        src_1.Record.dispatch = (evt) => events.push(evt);
        await bob.addToRelationship("parents", father.id);
        // local person record is updated
        expect(bob.data.parents[father.id]).to.equal(true);
        const localEvent = events.find(i => i.type === state_mgmt_1.FmEvents.RELATIONSHIP_ADDED_LOCALLY);
        // client event paths are numerically correct
        expect(localEvent.paths).to.have.lengthOf(4);
        // father record is updated too
        const pops = await src_1.Record.get(FancyPerson_1.FancyPerson, father.id);
        expect(pops.data.children[bob.id]).to.equal(true);
    });
    it("using addToRelationship() to add multiple relationships with inverse (M:M)", async () => {
        const results = await addFatherAndChildren();
        const pops = await src_1.Record.get(FancyPerson_1.FancyPerson, results.fatherId);
        expect(pops.data.children[results.bobId]).to.equal(true);
        expect(pops.data.children[results.chrissyId]).to.equal(true);
        const bob2 = await src_1.Record.get(FancyPerson_1.FancyPerson, results.bobId);
        expect(bob2.data.parents[results.fatherId]).to.equal(true);
    });
    it("using removeFromRelationship() works with inverse (M:M)", async () => {
        const results = await addFatherAndChildren();
        const father = await src_1.Record.get(FancyPerson_1.FancyPerson, results.fatherId);
        await father.removeFromRelationship("children", results.bobId);
        const pops = await src_1.Record.get(FancyPerson_1.FancyPerson, results.fatherId);
        expect(pops.data.children).to.haveOwnProperty(results.chrissyId);
        expect(pops.data.children).to.not.haveOwnProperty(results.bobId);
    });
    it("using addToRelationship() on a hasOne prop throws error", async () => {
        const bob = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob",
            age: 23
        });
        try {
            await bob.addToRelationship("employer", "4567");
        }
        catch (e) {
            expect(e.name).to.equal("firemodel/not-hasMany-reln");
        }
    });
    it("using setRelationship() on an hasOne prop sets relationship", async () => {
        // TODO: add in an inverse relationship; currently getting very odd decorator behavior
        let bob = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            id: "bobs-yur-uncle",
            name: "Bob",
            age: 23
        });
        const abc = await src_1.Record.add(Company_1.Company, {
            id: "e8899",
            name: "ABC Inc"
        });
        const dbWasUpdated = bob.setRelationship("employer", "e8899");
        // locally changed immediately
        expect(bob.get("employer")).to.equal("e8899");
        await dbWasUpdated;
        // also changed in DB after the wait
        bob = await src_1.Record.get(FancyPerson_1.FancyPerson, "bobs-yur-uncle");
        expect(bob.get("employer")).to.equal("e8899");
        const people = await List_1.List.all(FancyPerson_1.FancyPerson);
        const bob2 = people.findById(bob.id);
        expect(bob2.get("employer")).to.equal("e8899");
        const company = await src_1.Record.get(Company_1.Company, "e8899");
    });
    it("using clearRelationship() on an hasOne prop sets relationship", async () => {
        const bob = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob",
            age: 23
        });
        await bob.setRelationship("employer", "e8899");
        expect(bob.get("employer")).to.equal("e8899");
        await bob.clearRelationship("employer");
        expect(bob.get("employer")).to.equal("e8899");
    });
});
//# sourceMappingURL=relationship-client-spec.js.map