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
const index_1 = require("../src/index");
const abstracted_admin_1 = require("abstracted-admin");
const chai = __importStar(require("chai"));
const helpers = __importStar(require("./testing/helpers"));
const expect = chai.expect;
require("reflect-metadata");
const person_1 = require("./testing/person");
const FireModel_1 = require("../src/FireModel");
const Mock_1 = require("../src/Mock");
const state_mgmt_1 = require("../src/state-mgmt");
describe("List class: ", () => {
    let db;
    beforeEach(async () => {
        db = new abstracted_admin_1.DB({ mocking: true });
        await db.waitForConnection();
        FireModel_1.FireModel.defaultDb = db;
    });
    it("can instantiate with new operator", () => {
        const list = new index_1.List(person_1.Person);
        expect(list).to.be.instanceof(index_1.List);
        expect(list.length).to.equal(0);
        expect(list.modelName).to.equal("person");
        expect(list.pluralName).to.equal("people");
        expect(list.dbPath).to.equal(`${list.META.dbOffset}/people`);
    });
    it("can instantiate with create() method", () => {
        const list = index_1.List.create(person_1.Person, { db });
        expect(list).to.be.instanceof(index_1.List);
        expect(list.length).to.equal(0);
        expect(list.modelName).to.equal("person");
        expect(list.pluralName).to.equal("people");
        expect(list.dbPath).to.equal(`${list.META.dbOffset}/people`);
    });
    it("List can SET a dictionary of records", async () => {
        const list = await index_1.List.set(person_1.Person, {
            joe: {
                name: "Joe",
                age: 14
            },
            roger: {
                age: 22,
                name: "Roger"
            }
        });
        expect(list).to.have.lengthOf(2);
        expect(list.map(i => i.name)).to.include("Joe");
        expect(list.map(i => i.name)).to.include("Roger");
        expect(list.map(i => i.age)).to.include(14);
        expect(list.map(i => i.age)).to.include(22);
        expect(list.data[0].createdAt).is.a("number");
        expect(list.data[1].createdAt).is.a("number");
    });
    it("can instantiate with all() method", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 })
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 25).generate();
        const list = await index_1.List.all(person_1.Person, { db });
        expect(list).to.be.instanceof(index_1.List);
        expect(list.length).to.equal(25);
        expect(list.modelName).to.equal("person");
        expect(list.pluralName).to.equal("people");
        expect(list.dbPath).to.equal(`${list.META.dbOffset}/people`);
    });
    it("can instantiate with from() method", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 })
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 25).generate();
        const q = new abstracted_admin_1.SerializedQuery().limitToLast(5);
        const results = await index_1.List.fromQuery(person_1.Person, q, { db });
        expect(results.length).to.equal(5);
    });
    it("can instantiate with a where() method", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 })
        }))
            .pathPrefix("authenticated");
        db.mock
            .queueSchema("person", 10)
            .queueSchema("person", 2, { age: 99 })
            .generate();
        const oldFolks = await index_1.List.where(person_1.Person, "age", 99);
        const youngFolks = await index_1.List.where(person_1.Person, "age", ["<", 90]);
        expect(oldFolks).to.be.an.instanceof(index_1.List);
        expect(youngFolks).to.be.an.instanceof(index_1.List);
        expect(oldFolks.length).to.equal(2);
        expect(youngFolks.length).to.equal(10);
    });
    it("can instantiate with first() and last() methods", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const first = await index_1.List.first(person_1.Person, 5);
        const last = await index_1.List.last(person_1.Person, 5);
        const firstCreatedDate = first.data[0].createdAt;
        const lastCreatedDate = last.data[0].createdAt;
        expect(first).to.be.length(5);
        expect(last).to.be.length(5);
        expect(firstCreatedDate).to.be.lessThan(lastCreatedDate);
    });
    it("can instantiate with recent(), and inactive() methods", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const recent = await index_1.List.recent(person_1.Person, 6);
        const inactive = await index_1.List.inactive(person_1.Person, 4);
        const recentCreatedDate = recent.data[0].lastUpdated;
        const inactiveCreatedDate = inactive.data[0].lastUpdated;
        expect(recent).to.be.length(6);
        expect(inactive).to.be.length(4);
        expect(recentCreatedDate).to.be.greaterThan(inactiveCreatedDate);
    });
    it("can instantiate with since() returns correct results", async () => {
        const timestamp = new Date().getTime();
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 49 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: timestamp
        }))
            .pathPrefix("authenticated");
        db.mock
            .queueSchema("person", 30, { lastUpdated: timestamp - 5000 })
            .generate();
        db.mock
            .queueSchema("person", 8, { lastUpdated: timestamp + 1000 })
            .generate();
        const since = await index_1.List.since(person_1.Person, timestamp);
        expect(since).to.be.length(8);
    });
    it("an instantiated List can call get() with a valid ID and get a Record", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
        const list = await index_1.List.all(person_1.Person);
        const record = list.findById(firstPersonId);
        expect(record).to.be.an("object");
        expect(record).to.be.an.instanceOf(index_1.Record);
        expect(record.data).to.be.an.instanceOf(person_1.Person);
        expect(record.data.name).to.be.a("string");
    });
    it("an instantiated List can call getData() with a valid ID and get a Model", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
        const list = await index_1.List.all(person_1.Person);
        const person = list.getData(firstPersonId);
        expect(person).to.be.an("object");
        expect(person).to.be.an.instanceOf(person_1.Person);
        expect(person.name).to.be.a("string");
    });
    it("an instantiated List calling get() with an invalid ID throws an error", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const list = await index_1.List.all(person_1.Person);
        try {
            const record = list.findById("not-there");
            throw new Error("Invalid ID should have thrown error");
        }
        catch (e) {
            expect(e.name).to.equal("NotFound");
        }
    });
    it("an instantiated List calling get() with an invalid ID and default value returnes the default value", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const list = await index_1.List.all(person_1.Person);
        try {
            const record = list.findById("not-there", null);
            expect(record).to.equal(null);
        }
        catch (e) {
            throw new Error("When default value is provided no error should be raised");
        }
    });
    it("an instantiated List calling getData() with an invalid ID and default value returnes the default value", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const list = await index_1.List.all(person_1.Person);
        try {
            const record = list.getData("not-there", null);
            expect(record).to.equal(null);
        }
        catch (e) {
            throw new Error("When default value is provided no error should be raised");
        }
    });
    it("an instantiated List calling findData() with a valid ID returnes the default value", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30).generate();
        const list = await index_1.List.all(person_1.Person);
        try {
            const record = list.getData("not-there", null);
            expect(record).to.equal(null);
        }
        catch (e) {
            throw new Error("When default value is provided no error should be raised");
        }
    });
    it("using findWhere() returns a record when property/value is found", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30);
        db.mock.queueSchema("person", 1, { name: "foobar" });
        db.mock.queueSchema("person", 3, { age: 12 }).generate();
        const list = await index_1.List.all(person_1.Person);
        const firstPersonId = helpers.firstKey(db.mock.db.authenticated.people);
        expect(list.findWhere("id", firstPersonId)).is.an("object");
        expect(list.findWhere("name", "foobar")).is.an("object");
        expect(list.findWhere("age", 12)).is.an("object");
    });
    it("using findWhere() returns appropriately when record not found", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 3, { age: 12 }).generate();
        const list = await index_1.List.all(person_1.Person);
        try {
            expect(list.findWhere("name", "foobar")).is.an("object");
        }
        catch (e) {
            expect(e.name).to.equal("NotFound");
        }
        expect(list.findWhere("name", "foobar", "default")).to.equal("default");
    });
    it("using find() returns a record when passed in filter finds record", async () => {
        db.mock
            .addSchema("person", h => () => ({
            name: h.faker.name.firstName(),
            age: h.faker.random.number({ min: 1, max: 50 }),
            createdAt: h.faker.date.past().valueOf(),
            lastUpdated: h.faker.date.recent().valueOf()
        }))
            .pathPrefix("authenticated");
        db.mock.queueSchema("person", 30);
        db.mock.queueSchema("person", 1, { name: "foobar" });
        db.mock.queueSchema("person", 3, { age: 12 }).generate();
        const people = await index_1.List.all(person_1.Person);
        people.map(person => {
            expect(person.id).to.be.a("string");
            expect(person.age).to.be.a("number");
            const foundById = people.findWhere("id", person.id);
            const foundByAge = people.findWhere("age", person.age);
        });
    });
    it("using remove() able to change local state, db state, and state mgmt", async () => {
        await Mock_1.Mock(person_1.Person, db).generate(10);
        const events = [];
        index_1.Record.dispatch = (evt) => events.push(evt);
        const peeps = await index_1.List.all(person_1.Person);
        const id = peeps.data[1].id;
        const removed = await peeps.removeById(id);
        expect(peeps).to.have.lengthOf(9);
        const eventTypes = events.map(e => e.type);
        expect(eventTypes).to.contain(state_mgmt_1.FMEvents.RECORD_REMOVED);
        expect(eventTypes).to.contain(state_mgmt_1.FMEvents.RECORD_REMOVED_LOCALLY);
        expect(eventTypes).to.contain(state_mgmt_1.FMEvents.RECORD_LIST);
        const peeps2 = await index_1.List.all(person_1.Person);
        expect(peeps2).to.have.length(9);
        const ids = new Set(peeps2.map(p => p.id));
        expect(ids.has(id)).to.equal(false);
    });
    it("using add() changes local state, db state, and state mgmt", async () => {
        await Mock_1.Mock(person_1.Person, db).generate(10);
        const events = [];
        index_1.Record.dispatch = (evt) => events.push(evt);
        const peeps = await index_1.List.all(person_1.Person);
        expect(peeps).to.have.lengthOf(10);
        const newRec = await peeps.add({
            name: "Christy Brinkley",
            age: 50
        });
        expect(peeps).to.have.lengthOf(11);
        const ids = new Set(peeps.map(p => p.id));
        expect(ids.has(newRec.id)).to.equal(true);
        const eventTypes = events.map(e => e.type);
        expect(eventTypes).to.contain(state_mgmt_1.FMEvents.RECORD_ADDED);
        expect(eventTypes).to.contain(state_mgmt_1.FMEvents.RECORD_ADDED_LOCALLY);
    });
    it('local state includes the postFix default of "all"', async () => {
        const peeps = await index_1.List.all(person_1.Person);
        expect(peeps.localPath).to.equal("people/all");
    });
});
//# sourceMappingURL=list-spec.js.map