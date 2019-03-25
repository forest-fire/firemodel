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
const chai = __importStar(require("chai"));
const person_1 = require("./testing/person");
const state_mgmt_1 = require("../src/state-mgmt");
const abstracted_admin_1 = require("abstracted-admin");
const helpers_1 = require("./testing/helpers");
const VuexWrapper_1 = require("../src/VuexWrapper");
const expect = chai.expect;
describe("Dispatch →", () => {
    let db;
    beforeEach(async () => {
        db = new abstracted_admin_1.DB({ mocking: true });
        await db.waitForConnection();
        src_1.Record.defaultDb = db;
        src_1.Record.dispatch = null;
    });
    it("_getPaths() decomposes the update into an array of discrete update paths", async () => {
        const person = src_1.Record.create(person_1.Person);
        person._data.id = "12345"; // cheating a bit here
        const lastUpdated = new Date().getTime();
        const updated = {
            name: "Roger Rabbit",
            lastUpdated
        };
        const result = person._getPaths(updated);
        // expect(result.length).to.equal(2);
        result.map(i => {
            expect(i).to.haveOwnProperty("path");
            expect(i).to.haveOwnProperty("value");
            if (i.path.indexOf("lastUpdated") !== -1) {
                expect(i.value).to.equal(lastUpdated);
            }
            else {
                expect(i.value).to.equal("Roger Rabbit");
            }
        });
    });
    it("_createRecordEvent() produces correctly formed Redux event", async () => {
        const person = src_1.Record.create(person_1.Person);
        person._data.id = "12345"; // cheating a bit here
        const lastUpdated = new Date().getTime();
        const updated = {
            name: "Roger Rabbit",
            lastUpdated
        };
        const paths = person._getPaths(updated);
        const event = person._createRecordEvent(person, state_mgmt_1.FMEvents.RECORD_CHANGED_LOCALLY, paths);
        expect(event).is.an("object");
        expect(event.type).to.equal(state_mgmt_1.FMEvents.RECORD_CHANGED_LOCALLY);
        expect(event.dbPath).to.equal(`authenticated/people/12345`);
        expect(event.paths).to.equal(paths);
        expect(event.paths).to.have.lengthOf(2);
        expect(event.modelName).to.equal("person");
    });
    it("set() immediately changes value on Record", async () => {
        const person = await src_1.Record.add(person_1.Person, {
            name: "Jane",
            age: 18
        });
        person.set("name", "Carol");
        // expect(person.isDirty).to.equal(true);
        expect(person.get("name")).to.equal("Carol");
        await helpers_1.wait(15);
        expect(person.isDirty).to.equal(false);
    });
    it("waiting for set() fires the appropriate Redux event; and inProgress is set", async () => {
        const events = [];
        const person = await src_1.Record.add(person_1.Person, {
            name: "Jane",
            age: 18
        });
        src_1.Record.dispatch = (e) => events.push(e);
        await person.set("name", "Carol");
        expect(person.get("name")).to.equal("Carol"); // local change took place
        expect(events.length).to.equal(2); // two phase commit
        expect(person.isDirty).to.equal(false); // value already back to false
        // 1st EVENT (local change)
        let event = events[0];
        expect(event.type).to.equal(state_mgmt_1.FMEvents.RECORD_CHANGED_LOCALLY);
        expect(event.paths).to.have.lengthOf(2);
        event.paths.map(p => {
            switch (p.path.replace(/^\//, "")) {
                case "name":
                    expect(p.value).to.equal("Carol");
                    break;
                case "lastUpdated":
                    expect(p.value)
                        .to.be.a("number")
                        .and.lessThan(new Date().getTime());
                    break;
                default:
                    throw new Error(`Unexpected property path [ ${p.path} ] on set()`);
            }
        });
        // 2nd EVENT
        event = events[1];
        expect(event.type).to.equal(state_mgmt_1.FMEvents.RECORD_CHANGED);
        expect(event.paths).to.be.a("undefined");
        expect(event.value).to.be.an("object");
        expect(event.value.name).to.equal("Carol");
        expect(event.value.age).to.equal(18);
    });
    it("VuexWrapper converts calling structure to what Vuex expects", async () => {
        const events = [];
        const types = new Set();
        const vueDispatch = (type, payload) => {
            types.add(type);
            events.push(Object.assign({}, payload, { type }));
        };
        const person = await src_1.Record.add(person_1.Person, {
            name: "Jane",
            age: 18
        });
        src_1.Record.dispatch = VuexWrapper_1.VeuxWrapper(vueDispatch);
        await person.update({
            age: 12
        });
        await person.update({
            age: 25
        });
        expect(events).to.have.lengthOf(4);
        expect(types.size).to.equal(2);
    });
});
//# sourceMappingURL=dispatch-spec.js.map