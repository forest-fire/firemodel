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
const Person_1 = require("./testing/Person");
const PersonWithLocal_1 = require("./testing/PersonWithLocal");
const PersonWithLocalAndPrefix_1 = require("./testing/PersonWithLocalAndPrefix");
const state_mgmt_1 = require("../src/state-mgmt");
const abstracted_admin_1 = require("abstracted-admin");
const helpers_1 = require("./testing/helpers");
const VuexWrapper_1 = require("../src/VuexWrapper");
const util_1 = require("../src/util");
const expect = chai.expect;
describe("Dispatch →", () => {
    let db;
    beforeEach(async () => {
        db = new abstracted_admin_1.DB({ mocking: true });
        await db.waitForConnection();
        src_1.Record.defaultDb = db;
        src_1.Record.dispatch = null;
    });
    it("_getPaths() decomposes the changes into an array of discrete update paths", async () => {
        const person = await src_1.Record.add(Person_1.Person, {
            name: "Bob",
            gender: "male"
        });
        const p2 = await src_1.Record.createWith(Person_1.Person, {
            id: person.id,
            name: "Bob Marley",
            age: 55,
            gender: null
        });
        const validProperties = person.META.properties.map(i => i.property);
        const deltas = util_1.compareHashes(p2.data, person.data, validProperties);
        const result = person._getPaths(p2, deltas);
        expect(deltas.added).to.include("age");
        expect(deltas.changed).to.include("name");
        expect(deltas.removed).to.include("gender");
        Object.keys(result).map((key) => {
            if (key.includes("company")) {
                expect(result[key]).to.equal(null);
            }
            if (key.includes("age")) {
                expect(result[key]).to.equal(55);
            }
            if (key.includes("name")) {
                expect(result[key]).to.equal("Bob Marley");
            }
        });
    });
    it("set() immediately changes value on Record", async () => {
        const person = await src_1.Record.add(Person_1.Person, {
            name: "Jane",
            age: 18
        });
        person.set("name", "Carol");
        expect(person.isDirty).to.equal(true);
        expect(person.get("name")).to.equal("Carol");
        await helpers_1.wait(15);
        expect(person.isDirty).to.equal(false);
    });
    it("waiting for set() fires the appropriate Redux event; and inProgress is set", async () => {
        const events = [];
        const person = await src_1.Record.add(Person_1.Person, {
            name: "Jane",
            age: 18
        });
        src_1.Record.dispatch = (e) => events.push(e);
        await person.set("name", "Carol");
        expect(person.get("name")).to.equal("Carol"); // local change took place
        expect(events.length).to.equal(2); // two phase commit
        expect(person.isDirty).to.equal(false); // value  back to false
        // 1st EVENT (local change)
        let event = events[0];
        expect(event.type).to.equal(state_mgmt_1.FmEvents.RECORD_CHANGED_LOCALLY);
        expect(event.value.name).to.equal("Carol");
        // 2nd EVENT
        event = events[1];
        expect(event.type).to.equal(state_mgmt_1.FmEvents.RECORD_CHANGED_CONFIRMATION);
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
        const person = await src_1.Record.add(Person_1.Person, {
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
    it("By default the localPath is the singular modelName", async () => {
        const events = [];
        const types = new Set();
        const vueDispatch = (type, payload) => {
            types.add(type);
            events.push(Object.assign({}, payload, { type }));
        };
        const person = await src_1.Record.add(Person_1.Person, {
            name: "Jane",
            age: 18
        });
        src_1.Record.dispatch = VuexWrapper_1.VeuxWrapper(vueDispatch);
        await person.update({
            age: 12
        });
        events.forEach(event => expect(event.localPath).to.equal(event.modelName));
    });
    it("When @model decorator and setting localModelName we can override the localPath", async () => {
        const events = [];
        const types = new Set();
        const vueDispatch = (type, payload) => {
            types.add(type);
            events.push(Object.assign({}, payload, { type }));
        };
        const person = await src_1.Record.add(PersonWithLocal_1.PersonWithLocal, {
            name: "Jane",
            age: 18
        });
        src_1.Record.dispatch = VuexWrapper_1.VeuxWrapper(vueDispatch);
        await person.update({
            age: 12
        });
        events.forEach(event => expect(event.localPath).to.equal(person.META.localModelName));
    });
    it("The when dispatching events without a listener the source is 'unknown'", async () => {
        const events = [];
        const types = new Set();
        const vueDispatch = (type, payload) => {
            types.add(type);
            events.push(Object.assign({}, payload, { type }));
        };
        const person = await src_1.Record.add(PersonWithLocalAndPrefix_1.PersonWithLocalAndPrefix, {
            name: "Jane",
            age: 18
        });
        src_1.Record.dispatch = VuexWrapper_1.VeuxWrapper(vueDispatch);
        await person.update({
            age: 12
        });
        events.forEach(event => expect(event.watcherSource).to.equal("unknown"));
    });
});
//# sourceMappingURL=dispatch-spec.js.map