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
const abstracted_admin_1 = require("abstracted-admin");
const chai = __importStar(require("chai"));
const expect = chai.expect;
const FireModel_1 = require("../src/FireModel");
const Watch_1 = require("../src/Watch");
const person_1 = require("./testing/person");
const helpers_1 = require("./testing/helpers");
const state_mgmt_1 = require("../src/state-mgmt");
const common_types_1 = require("common-types");
helpers_1.setupEnv();
describe("Watch →", () => {
    let realDB;
    before(async () => {
        realDB = await abstracted_admin_1.DB.connect();
        FireModel_1.FireModel.defaultDb = realDB;
    });
    afterEach(async () => {
        Watch_1.Watch.stop();
    });
    it("Watching a Record gives back a hashCode which can be looked up", async () => {
        FireModel_1.FireModel.defaultDb = await abstracted_client_1.DB.connect({ mocking: true });
        const { watcherId } = Watch_1.Watch.record(person_1.Person, "12345")
            .dispatch(() => "")
            .start();
        expect(watcherId).to.be.a("string");
        expect(Watch_1.Watch.lookup(watcherId)).to.be.an("object");
        expect(Watch_1.Watch.lookup(watcherId)).to.haveOwnProperty("eventType");
        expect(Watch_1.Watch.lookup(watcherId)).to.haveOwnProperty("query");
        expect(Watch_1.Watch.lookup(watcherId)).to.haveOwnProperty("createdAt");
    });
    it("Watching CRUD actions on Record", async () => {
        FireModel_1.FireModel.defaultDb = realDB;
        const events = [];
        const cb = (event) => {
            events.push(event);
        };
        FireModel_1.FireModel.dispatch = cb;
        const w = await Watch_1.Watch.record(person_1.Person, "1234").start();
        expect(Watch_1.Watch.inventory[w.watcherId]).to.be.an("object");
        expect(Watch_1.Watch.inventory[w.watcherId].eventType).to.equal("value");
        expect(Watch_1.Watch.inventory[w.watcherId].dbPath).to.equal("authenticated/people/1234");
        await FireModel_1.FireModel.defaultDb.remove("/authenticated/people/1234");
        await FireModel_1.FireModel.defaultDb.set("/authenticated/people/1234", {
            name: "Bob",
            age: 15
        });
        await FireModel_1.FireModel.defaultDb.update("/authenticated/people/1234", {
            age: 23
        });
        const eventTypes = new Set(events.map(e => e.type));
        expect(eventTypes.size).to.equal(3);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_CHANGED)).to.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_REMOVED)).to.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.WATCHER_STARTED)).to.equal(true);
    });
    it("Watching CRUD actions on List", async () => {
        FireModel_1.FireModel.defaultDb = realDB;
        const events = [];
        const cb = (event) => {
            events.push(event);
        };
        await realDB.remove("/authenticated/people");
        Watch_1.Watch.list(person_1.Person)
            .all()
            .dispatch(cb)
            .start();
        await src_1.Record.add(person_1.Person, {
            id: "1234",
            name: "Richard",
            age: 44
        });
        await src_1.Record.add(person_1.Person, {
            id: "4567",
            name: "Carrie",
            age: 33
        });
        await common_types_1.wait(500);
        // Initial response is to bring in all records
        // expect(events).to.have.lengthOf(2);
        let eventTypes = new Set(events.map(e => e.type));
        console.log(eventTypes);
        expect(eventTypes.size).to.equal(2);
        expect(eventTypes.has(state_mgmt_1.FMEvents.WATCHER_STARTED));
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_ADDED));
        // Now we'll do some more CRUD activities
        await FireModel_1.FireModel.defaultDb.set("/authenticated/people/1234", {
            name: "Bob",
            age: 15
        });
        await FireModel_1.FireModel.defaultDb.remove("/authenticated/people/1234");
        await FireModel_1.FireModel.defaultDb.update("/authenticated/people/4567", {
            age: 88
        });
        eventTypes = new Set(events.map(e => e.type));
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_CHANGED)).to.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_REMOVED)).to.equal(true);
        expect(eventTypes.has(state_mgmt_1.FMEvents.RECORD_ADDED)).to.equal(true);
    });
    it("start() increases watcher count, stop() decreases it", async () => {
        Watch_1.Watch.reset();
        FireModel_1.FireModel.dispatch = () => "";
        expect(Watch_1.Watch.watchCount).to.equal(0);
        const { watcherId: hc1 } = Watch_1.Watch.record(person_1.Person, "989898").start();
        const { watcherId: hc2 } = Watch_1.Watch.record(person_1.Person, "45645645").start();
        expect(Watch_1.Watch.watchCount).to.equal(2);
        Watch_1.Watch.stop(hc1);
        expect(Watch_1.Watch.watchCount).to.equal(1);
        expect(Watch_1.Watch.lookup(hc2)).to.be.an("object");
        try {
            Watch_1.Watch.lookup(hc1);
            throw new Error("looking up an invalid hashcode should produce error!");
        }
        catch (e) {
            expect(e.name).to.equal("FireModel::InvalidHashcode");
        }
    });
});
//# sourceMappingURL=watch-spec.js.map