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
const klass_1 = require("./testing/klass");
const Person_1 = require("./testing/Person");
const expect = chai.expect;
describe.skip("schema() decorator: ", () => {
    it("can read Schema meta properties", () => {
        const myclass = new klass_1.Klass();
        expect(myclass.META.dbOffset).to.equal("authenticated");
        expect(myclass.META.localPrefix).to.equal("foobar");
    });
    it("can read Property meta properties off of META.property", () => {
        const myclass = new klass_1.Klass();
        expect(myclass.META.property("foo").type).to.equal("String");
        expect(myclass.META.property("bar").type).to.equal("Number");
        expect(myclass.META.property("bar3").max).to.equal(10);
    });
    it("setting meta throws error", () => {
        const myclass = new klass_1.Klass();
        try {
            myclass.META = { foo: "bar" };
            expect(false, "setting meta property is not allowed!");
        }
        catch (e) {
            expect(e.message).to.equal("The META properties should only be set with the @model decorator at design time!");
        }
    });
});
describe("property decorator: ", () => {
    it("can discover type for properties on class", () => {
        const myclass = new klass_1.Klass();
        expect(Reflect.getMetadata("foo", myclass).type).to.equal("string");
        expect(Reflect.getMetadata("bar", myclass).type).to.equal("number");
        expect(Reflect.getMetadata("bar2", myclass).type).to.equal("number");
        expect(Reflect.getMetadata("sub", myclass).type).to.equal("string");
        expect(Reflect.getMetadata("id", myclass).type).to.equal("string");
    });
    it("constraint() decorator-factory adds constrain metadata", () => {
        const myclass = new klass_1.Klass();
        expect(Reflect.getMetadata("bar", myclass).min).to.equal(2);
    });
    it("constrainedProperty() decorator-factory allows adding multiple contraints", () => {
        const myclass = new klass_1.Klass();
        expect(Reflect.getMetadata("foobar", myclass).length).to.equal(15);
        expect(Reflect.getMetadata("foobar", myclass).desc).to.equal("who doesn't love a foobar?");
        expect(Reflect.getMetadata("bar3", myclass).min).to.equal(5);
        expect(Reflect.getMetadata("bar3", myclass).max).to.equal(10);
    });
    it("@pushKey decorator is reflected in meta", () => {
        const myclass = new klass_1.Klass();
        expect(Reflect.getMetadata("tags", myclass).pushKey).to.equal(true);
        expect(myclass.META.pushKeys).to.include("tags");
        expect(myclass.META.pushKeys).to.have.lengthOf(1);
        const myRecord = src_1.Record.create(klass_1.Klass);
        expect(myRecord.pushKeys).to.include("tags");
    });
    it("@min(), @max(), @length(), and @desc() decorator-factories work", () => {
        const myclass = new klass_1.Klass();
    });
    it("all base meta keys are represented", () => {
        const myclass = new klass_1.Klass();
        const keys = Reflect.getMetadataKeys(myclass);
        expect(keys).to.include.members(["id", "lastUpdated", "createdAt"]);
    });
});
describe("relationship decorators: ", () => {
    it("hasOne() sets correct meta props", async () => {
        const person = new Person_1.Person();
        const keys = Reflect.getMetadataKeys(person);
        expect(keys).to.include.members(["father", "mother"]);
        expect(person.META.relationship("father").isRelationship).to.equal(true);
        expect(person.META.relationship("father").relType).to.be.equal("hasOne");
        expect(person.META.relationship("mother").relType).to.be.equal("hasOne");
    });
    it("hasMany() sets correct meta props", async () => {
        const person = new Person_1.Person();
        const keys = Reflect.getMetadataKeys(person);
        expect(keys).to.include.members(["children"]);
        expect(person.META.relationship("children").isRelationship).to.equal(true);
        expect(person.META.relationship("children").relType).to.be.equal("hasMany");
    });
    it("@relationships show up on Schema's relationships array", async () => {
        const person = new Person_1.Person();
        const ids = person.META.relationships.map(r => r.property);
        expect(ids).to.include("father");
        expect(ids).to.include("mother");
        expect(ids).to.include("children");
        expect(ids).to.include("concerts");
        expect(ids).to.include("company");
        expect(ids).to.include("pays");
    });
    it("@relationships show up on Model", async () => {
        const PersonRecord = src_1.Record.create(Person_1.Person, {
            db: new abstracted_admin_1.DB({ mocking: true })
        });
        expect(PersonRecord.META.relationships.map(p => p.property)).to.include("father");
        expect(PersonRecord.META.relationships.map(p => p.property)).to.include("children");
    });
    it("@properties show up on Schema's properties array", async () => {
        const person = new Person_1.Person();
        const props = person.META.properties.map(r => r.property);
        // positive tests
        expect(props).to.include("name");
        expect(props).to.include("age");
        expect(props).to.include("lastUpdated");
        expect(props).to.include("createdAt");
        // negative tests
        expect(props).to.not.include("mother");
        expect(props).to.not.include("concerts");
    });
    it("@relationships represent all relationships in a model", async () => {
        const person = new Person_1.Person();
        const props = person.META.relationships.map(r => r.property);
        expect(props).to.include("mother");
        expect(props).to.include("father");
        expect(props).to.include("parents");
        expect(props).to.include("concerts");
        expect(props).to.include("company");
        expect(props).to.include("pays");
        person.META.relationships.map(p => {
            if (p.relType === "hasOne") {
                expect(p.type).to.equal("String");
            }
            if (p.relType === "hasMany") {
                expect(p.type).to.equal("Object");
            }
        });
        const mother = person.META.relationships.filter(i => i.property === "mother")[0];
        expect(mother.inverseProperty).to.equal("children");
    });
    it("@properties show up on Model", async () => {
        const PersonRecord = src_1.Record.create(Person_1.Person, {
            db: new abstracted_admin_1.DB({ mocking: true })
        });
        expect(PersonRecord.META.properties.map(p => p.property)).to.include("name");
        expect(PersonRecord.META.properties.map(p => p.property)).to.include("lastUpdated");
    });
    it("inverse() sets correct meta props", async () => {
        const person = new Person_1.Person();
        expect(person.META.relationship("mother").inverseProperty).to.equal("children");
        expect(person.META.relationship("father").inverseProperty).to.equal("children");
    });
});
//# sourceMappingURL=meta-spec.js.map