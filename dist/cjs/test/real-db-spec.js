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
const Person_1 = require("./testing/Person");
const helpers = __importStar(require("./testing/helpers"));
const FireModel_1 = require("../src/FireModel");
const common_types_1 = require("common-types");
const FancyPerson_1 = require("./testing/FancyPerson");
helpers.setupEnv();
const db = new abstracted_admin_1.DB();
FireModel_1.FireModel.defaultDb = db;
describe("Tests using REAL db =>�", () => {
    before(async () => {
        await db.waitForConnection();
    });
    after(async () => {
        await db.remove(`/authenticated/fancyPeople`, true);
    });
    it("List.since() works", async () => {
        try {
            await src_1.Record.add(Person_1.Person, {
                name: "Carl Yazstrimski",
                age: 99
            });
            const timestamp = new Date().getTime();
            await helpers.wait(50);
            await src_1.Record.add(Person_1.Person, {
                name: "Bob Geldof",
                age: 65
            });
            const since = src_1.List.since(Person_1.Person, timestamp);
            // cleanup
            await db.remove("/authenticated");
        }
        catch (e) {
            throw e;
        }
    });
    it("Adding a record to the database creates the appropriate number of dispatch events", async () => {
        const events = [];
        FireModel_1.FireModel.dispatch = (e) => {
            events.push(e);
        };
        const w = await src_1.Watch.list(FancyPerson_1.FancyPerson)
            .all()
            .start({ name: "my-test-watcher" });
        const eventTypes = Array.from(new Set(events.map(e => e.type)));
        expect(eventTypes).to.include(src_1.FmEvents.WATCHER_STARTING);
        expect(eventTypes).to.include(src_1.FmEvents.WATCHER_STARTED);
        expect(eventTypes).to.not.include(src_1.FmEvents.RECORD_ADDED);
        expect(eventTypes).to.not.include(src_1.FmEvents.RECORD_ADDED_LOCALLY);
        await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob the Builder"
        });
        const eventTypes2 = Array.from(new Set(events.map(e => e.type)));
        expect(eventTypes2).to.include(src_1.FmEvents.RECORD_ADDED);
    });
    it("Updating a record with duplicate values does not fire event watcher event", async () => {
        const events = [];
        const bob = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob Marley"
        });
        const w = await src_1.Watch.list(FancyPerson_1.FancyPerson)
            .all()
            .start({ name: "my-update-watcher" });
        FireModel_1.FireModel.dispatch = (e) => events.push(e);
        await src_1.Record.update(FancyPerson_1.FancyPerson, bob.id, { name: "Bob Marley" });
        await common_types_1.wait(50);
        const eventTypes = Array.from(new Set(events.map(e => e.type)));
        expect(eventTypes).to.include(src_1.FmEvents.RECORD_CHANGED_LOCALLY);
        expect(eventTypes).to.include(src_1.FmEvents.RECORD_CHANGED_CONFIRMATION);
        expect(eventTypes).to.not.include(src_1.FmEvents.RECORD_CHANGED);
    });
    it("Detects changes at various nested levels of the watch/listener", async () => {
        let events = [];
        const jack = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Jack Johnson"
        });
        FireModel_1.FireModel.dispatch = (e) => events.push(e);
        const w = await src_1.Watch.list(FancyPerson_1.FancyPerson)
            .all()
            .start({ name: "path-depth-test" });
        // deep path set
        const deepPath = common_types_1.pathJoin(jack.dbPath, "/favorite/sports/basketball");
        await db.set(deepPath, true);
        const eventTypes = Array.from(new Set(events.map(e => e.type)));
        expect(eventTypes).to.include(src_1.FmEvents.WATCHER_STARTING);
        expect(eventTypes).to.include(src_1.FmEvents.WATCHER_STARTED);
        expect(eventTypes).to.include(src_1.FmEvents.RECORD_ADDED);
        const added = events
            .filter(e => e.type === src_1.FmEvents.RECORD_ADDED)
            .pop();
        expect(added.key).to.equal(jack.id);
        events = [];
        // child path updated directly
        const childPath = common_types_1.pathJoin(jack.dbPath, "/favorite");
        await db.set(childPath, "steelers");
        expect(events).to.have.lengthOf(1);
        const updated = events.pop();
        expect(updated.type).to.equal(src_1.FmEvents.RECORD_CHANGED);
        expect(updated.key).to.equal(jack.id);
        events = [];
        // full update of record
        await db.set(jack.dbPath, {
            name: jack.data.name,
            favorite: "red sox"
        });
        expect(events).to.have.lengthOf(1);
        const replaced = events.pop();
        expect(replaced.type).to.equal(src_1.FmEvents.RECORD_CHANGED);
        expect(replaced.key).to.equal(jack.id);
    });
    it("value listener returns correct key and value", async () => {
        const events = [];
        FireModel_1.FireModel.dispatch = (e) => events.push(e);
        const w = await src_1.Watch.record(FancyPerson_1.FancyPerson, "abcd").start({
            name: "value-listener"
        });
        const person = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            id: "abcd",
            name: "Jim Jones"
        });
        const addEvents = events.filter(e => e.type === src_1.FmEvents.RECORD_CHANGED);
        expect(addEvents).to.have.lengthOf(1);
        expect(addEvents[0].key).to.equal(person.id);
    });
});
//# sourceMappingURL=real-db-spec.js.map