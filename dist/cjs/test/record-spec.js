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
require("reflect-metadata");
const person_1 = require("./testing/person");
const PersonAsPeeps_1 = require("./testing/PersonAsPeeps");
const FireModel_1 = require("../src/FireModel");
const state_mgmt_1 = require("../src/state-mgmt");
const Mock_1 = require("../src/Mock");
describe("Record > ", () => {
    let db;
    beforeEach(async () => {
        db = new abstracted_admin_1.DB({ mocking: true });
        await db.waitForConnection();
        FireModel_1.FireModel.defaultDb = db;
        FireModel_1.FireModel.dispatch = null;
    });
    it("can instantiate with new operator", async () => {
        const person = new src_1.Record(person_1.Person);
        expect(person.modelName).to.equal("person");
    });
    it("Record's add() factory adds record to database", async () => {
        const r = await src_1.Record.add(person_1.Person, {
            name: "Bob Marley",
            age: 40
        });
        expect(r).to.be.instanceof(src_1.Record);
        expect(r.get("name")).to.equal("Bob Marley");
        expect(r.id).to.exist.and.be.a("string");
        // test DB too
        const fromDb = await src_1.Record.get(person_1.Person, r.id);
        expect(fromDb).to.be.instanceof(src_1.Record);
        expect(fromDb.get("name")).to.equal("Bob Marley");
        expect(fromDb.id).to.exist.and.be.a("string");
    });
    it(`Record's static add() fires client events`, async () => {
        const events = [];
        src_1.Record.dispatch = (payload) => events.push(payload);
        const r = await src_1.Record.add(person_1.Person, {
            name: "Bob",
            age: 40
        });
        expect(events).to.have.lengthOf(2);
        const eventTypes = new Set(events.map(e => e.type));
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_ADDED_CONFIRMATION)).to.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_ADDED_LOCALLY)).to.equal(true);
    });
    it("Record's load() populates state, does not add to db", async () => {
        const r = src_1.Record.createWith(person_1.Person, {
            name: "Bob",
            age: 40
        });
        expect(r).to.be.instanceof(src_1.Record);
        expect(r.get("name")).to.equal("Bob");
        expect(r.id).to.be.an("undefined");
    });
    it("Once an ID is set it can not be reset", async () => {
        const r = await src_1.Record.add(person_1.Person, {
            name: "Bob",
            age: 40
        });
        const id = r.id;
        try {
            r.id = "12345";
            throw new Error("Let ID be reset!");
        }
        catch (e) {
            expect(r.id).to.equal(id);
            expect(e.name).to.equal("NotAllowed");
        }
    });
    it("using pushKey sets state locally immediately", async () => {
        db.set("/authenticated/people/1234", {
            name: "Bart Simpson",
            age: 10
        });
        const bart = await src_1.Record.get(person_1.Person, "1234", { db });
        const k1 = await bart.pushKey("tags", "doh!");
        const k2 = await bart.pushKey("tags", "whazzup?");
        expect(bart.data.tags[k1]).to.equal("doh!");
        expect(bart.data.tags[k2]).to.equal("whazzup?");
        expect(Object.keys(bart.data.tags).length).to.equal(2);
    });
    it("using pushKey updates lastUpdated", async () => {
        const now = new Date().getTime();
        await db.set("/authenticated/people/1234", {
            name: "Bart Simpson",
            age: 10,
            lastUpdated: now,
            createdAt: now
        });
        const bart = await src_1.Record.get(person_1.Person, "1234", { db });
        const backThen = bart.data.createdAt;
        expect(bart.data.lastUpdated).to.equal(backThen);
        const pk = await bart.pushKey("tags", "doh!");
        const result = await src_1.Record.get(person_1.Person, "1234", { db });
        expect(result.data.tags[pk]).to.equal("doh!");
        expect(result.data.lastUpdated).to.be.greaterThan(backThen);
        expect(result.data.createdAt).to.equal(backThen);
    });
    it("create Record with static get() factory", async () => {
        await db.set("/authenticated/people/8888", {
            name: "Roger Rabbit",
            age: 3,
            tags: { 123: "cartoon" },
            company: "disney"
        });
        const roger = await src_1.Record.get(person_1.Person, "8888");
        expect(roger).to.be.an.instanceOf(src_1.Record);
        expect(roger.data).to.be.an.instanceOf(person_1.Person);
        expect(roger.get("name")).to.equal("Roger Rabbit");
        expect(roger.get("age")).to.equal(3);
        expect(roger.get("company")).to.equal("disney");
        expect(roger.data.tags["123"]).to.equal("cartoon");
    });
    it("using update() allows non-destructive updates on object type when initial value is undefined", async () => {
        await db.set("/authenticated/people/8888", {
            name: "Roger Rabbit",
            age: 3,
            company: "disney",
            lastUpdated: 12345
        });
        const roger = await src_1.Record.get(person_1.Person, "8888");
        await roger.update({
            tags: { "456": "something else" },
            scratchpad: { foo: "bar" }
        });
        // IMMEDIATE CHANGE on RECORD
        expect(roger.get("tags")).to.haveOwnProperty("456");
        expect(roger.get("scratchpad")).to.haveOwnProperty("foo");
        // CHANGE REFLECTED after pulling from DB
        const bugs = await src_1.Record.get(person_1.Person, "8888");
        expect(bugs.get("tags")).to.haveOwnProperty("456");
        expect(bugs.get("scratchpad")).to.haveOwnProperty("foo");
    });
    it("using update triggers correct client-side events", async () => {
        await db.set("/authenticated/people/8888", {
            name: "Roger Rabbit",
            age: 3,
            company: "disney",
            lastUpdated: 12345
        });
        const roger = await src_1.Record.get(person_1.Person, "8888");
        const events = [];
        FireModel_1.FireModel.dispatch = (evt) => events.push(evt);
        expect(roger.dispatchIsActive).to.equal(true);
        await roger.update({
            name: "Roger Rabbit, III",
            age: 4
        });
        await roger.update({
            age: 13
        });
        FireModel_1.FireModel.dispatch = null;
        expect(events).to.have.lengthOf(4);
        expect(roger.get("name")).to.equal("Roger Rabbit, III");
        expect(roger.get("age")).to.equal(13);
    });
    it("calling dbPath() before the ID is known provides useful error", async () => {
        const record = src_1.Record.create(person_1.Person, { db });
        try {
            const foo = record.dbPath;
            throw new Error("Error should have happened");
        }
        catch (e) {
            expect(e.code).to.equal("record/not-ready");
            expect(e.message).contains("dbPath before");
        }
    });
    it("calling remove() removes from DB and notifies FE state-mgmt", async () => {
        await Mock_1.Mock(person_1.Person, db)
            .createRelationshipLinks()
            .generate(10);
        const peeps = await src_1.List.all(person_1.Person);
        expect(peeps.length).to.equal(10);
        const person = src_1.Record.createWith(person_1.Person, peeps.data[0]);
        const id = person.id;
        const events = [];
        FireModel_1.FireModel.dispatch = (evt) => events.push(evt);
        await person.remove();
        expect(events).to.have.lengthOf(2);
        const eventTypes = new Set(events.map(e => e.type));
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_REMOVED_LOCALLY)).is.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_REMOVED_CONFIRMATION)).is.equal(true);
        const peeps2 = await src_1.List.all(person_1.Person);
        console.log("person id", id);
        console.log(peeps2.map(i => i.id));
        expect(peeps2).to.have.lengthOf(9);
        const ids = peeps2.map(p => p.id);
        expect(ids.includes(id)).to.equal(false);
    }).timeout(3000);
    it("calling static remove() removes from DB, notifies FE state-mgmt", async () => {
        await Mock_1.Mock(person_1.Person, db)
            .createRelationshipLinks()
            .generate(10);
        const peeps = await src_1.List.all(person_1.Person);
        const id = peeps.data[0].id;
        expect(peeps.length).to.equal(10);
        const events = [];
        FireModel_1.FireModel.dispatch = (evt) => events.push(evt);
        const removed = await src_1.Record.remove(person_1.Person, id);
        expect(removed.id).to.equal(id);
        expect(events).to.have.lengthOf(2);
        const eventTypes = new Set(events.map(e => e.type));
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_REMOVED_LOCALLY)).is.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_REMOVED_ROLLBACK)).is.equal(true);
        const peeps2 = await src_1.List.all(person_1.Person);
        expect(peeps2).to.have.lengthOf(9);
        const ids = peeps2.map(p => p.id);
        expect(ids.includes(id)).to.equal(false);
    }).timeout(3000);
    it("setting an explicit value for plural is picked up by Record", async () => {
        const p = src_1.Record.create(PersonAsPeeps_1.Person);
        expect(p.modelName).to.equal("person");
        expect(p.META.plural).to.equal("peeps");
        expect(p.pluralName).to.equal("peeps");
    });
}).timeout(4000);
//# sourceMappingURL=record-spec.js.map