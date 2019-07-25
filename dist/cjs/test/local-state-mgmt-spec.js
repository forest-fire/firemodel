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
const chai = __importStar(require("chai"));
const expect = chai.expect;
const abstracted_admin_1 = require("abstracted-admin");
const src_1 = require("../src");
const Person_1 = require("./testing/localStateMgmt/Person");
const DynamicPerson_1 = require("./testing/localStateMgmt/DynamicPerson");
const PostfixPerson_1 = require("./testing/localStateMgmt/PostfixPerson");
describe("Client state management", () => {
    let db;
    before(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.FireModel.defaultDb = db;
    });
    it("when using a RECORD, the localPath is equal to the prefix plus 'localModelName' if there are no dynamic components", async () => {
        const person = await src_1.Record.create(Person_1.Person);
        expect(person.localPath).to.equal(person.localPrefix + "/" + person.META.localModelName);
        expect(person.localDynamicComponents)
            .to.be.an("array")
            .and.have.lengthOf(0);
    });
    it("when using a RECORD, dynamic components from localPrefix are expanded in localPath", async () => {
        const person = await src_1.Record.create(DynamicPerson_1.DynamicPerson);
        person.id = "1234";
        expect(person.localDynamicComponents).to.contain("id");
        expect(person.localPrefix).to.equal("/foo/bar/:id");
        expect(person.localPath).to.equal("/foo/bar/1234/dynamicPerson");
    });
    it("when using a LIST, the localPath is the prefix, pluralName (assuming no dynamic components)", async () => {
        const people = await src_1.List.all(Person_1.Person);
        expect(people.localPath).to.equal(src_1.pathJoin(people.META.localPrefix, people.pluralName));
        expect(people.localPostfix).to.equal("all");
    });
    it("when using a LIST, the localPath is the prefix, pluralName, and then the postFix if it is set", async () => {
        const people = await src_1.List.all(PostfixPerson_1.PostfixPerson);
        expect(people.META.localPostfix).to.equal("since");
        expect(people.localPath).to.equal(src_1.pathJoin(people.META.localPrefix, people.pluralName));
        expect(people.localPostfix).to.equal("since");
    });
});
//# sourceMappingURL=local-state-mgmt-spec.js.map