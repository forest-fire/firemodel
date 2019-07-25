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
const Person_1 = require("./testing/default-values/Person");
const expect = chai.expect;
describe("defaultValue() → ", () => {
    before(async () => {
        const db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.FireModel.defaultDb = db;
    });
    it("defaultValue is used when not set with add()", async () => {
        const p = await src_1.Record.add(Person_1.Person, {
            age: 34
        });
        expect(p.data.age).is.equal(34);
        expect(p.data.currentDeliveryAddress).is.equal("home");
        expect(p.data.priorDeliveryAddress).is.equal("work");
    });
    it("defaultValue is ignored when not set with add()", async () => {
        const p = await src_1.Record.add(Person_1.Person, {
            age: 34,
            priorDeliveryAddress: "foo"
        });
        expect(p.data.age).is.equal(34);
        expect(p.data.currentDeliveryAddress).is.equal("home");
        expect(p.data.priorDeliveryAddress).is.equal("foo");
    });
    // TODO: Look at this test, it is exhibiting odd async behaviour
    it.skip("mocking ignores defaultValue", async () => {
        await src_1.Mock(Person_1.Person).generate(10);
        const people = await src_1.List.all(Person_1.Person);
        people.map(person => {
            expect(person.currentDeliveryAddress).to.equal("work");
            expect(person.priorDeliveryAddress).to.equal("home");
        });
    });
});
//# sourceMappingURL=default-value-spec.js.map