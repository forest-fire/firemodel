"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const src_1 = require("../src");
const abstracted_admin_1 = require("abstracted-admin");
const chai = __importStar(require("chai"));
const expect = chai.expect;
const Person_1 = require("./testing/Person");
const FireModel_1 = require("../src/FireModel");
const FancyPerson_1 = require("./testing/FancyPerson");
const state_mgmt_1 = require("../src/state-mgmt");
const Company_1 = require("./testing/Company");
const Pay_1 = require("./testing/Pay");
const extractFksFromPaths_1 = require("../src/record/extractFksFromPaths");
const Car_1 = require("./testing/Car");
const Car_2 = __importDefault(require("./testing/dynamicPaths/Car"));
const buildRelationshipPaths_1 = require("../src/record/relationships/buildRelationshipPaths");
const common_types_1 = require("common-types");
const createCompositeKeyFromFkString_1 = require("../src/record/createCompositeKeyFromFkString");
const DeepPerson_1 = __importDefault(require("./testing/dynamicPaths/DeepPerson"));
const hasManyPaths = (id, now) => [
    { path: `/authenticated/people/${id}/children/janet`, value: true },
    { path: `/authenticated/people/${id}/children/bob`, value: true },
    { path: `/authenticated/people/${id}/lastUpdated`, value: now },
    { path: `/authenticated/people/abc/lastUpdated`, value: now }
];
const hasOnePaths = (id, now) => [
    { path: `/authenticated/people/${id}/company`, value: "microsoft" },
    { path: `/authenticated/people/${id}/lastUpdated`, value: now },
    { path: `/authenticated/companies/microsoft/employees/${id}`, value: true },
    { path: `/authenticated/companies/microsoft/lastUpdated`, value: now }
];
describe("Relationship > ", () => {
    let db;
    beforeEach(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true, mockData: {} });
        FireModel_1.FireModel.defaultDb = db;
    });
    it("extractFksFromPath pulls out the ids which are being changed", async () => {
        const person = src_1.Record.createWith(Person_1.Person, { id: "joe", name: "joe" });
        const now = 12312256;
        const hasMany = hasManyPaths(person.id, now);
        const hasOne = hasOnePaths(person.id, now);
        const extractedHasMany = extractFksFromPaths_1.extractFksFromPaths(person, "children", hasMany);
        const extractedHasOne = extractFksFromPaths_1.extractFksFromPaths(person, "company", hasOne);
        expect(extractedHasMany)
            .to.be.an("array")
            .and.have.lengthOf(2);
        expect(extractedHasOne)
            .to.be.an("array")
            .and.to.have.lengthOf(1);
        expect(extractedHasMany).to.include("janet");
        expect(extractedHasMany).to.include("bob");
        expect(extractedHasOne).to.include("microsoft");
    });
    it("build relationship paths for 1:M", async () => {
        const person = src_1.Record.createWith(Person_1.Person, { id: "joe", name: "joe" });
        const paths = buildRelationshipPaths_1.buildRelationshipPaths(person, "children", "abcdef");
        expect(paths.map(i => i.path)).to.include(common_types_1.pathJoin(person.dbPath, "children", "abcdef"));
    });
    it("build relationship paths for 1:M (with inverse)", async () => {
        const person = src_1.Record.createWith(Person_1.Person, { id: "joe", name: "joe" });
        const company = src_1.Record.createWith(Company_1.Company, {
            id: "microsoft",
            name: "Microsquish"
        });
        const paths = buildRelationshipPaths_1.buildRelationshipPaths(person, "company", "microsoft");
        expect(paths.map(i => i.path)).to.include(common_types_1.pathJoin(person.dbPath, "company"));
        const pathWithFkRef = paths
            .filter(p => p.path.includes(common_types_1.pathJoin(person.dbPath, "company")))
            .pop();
        const pathWithInverseRef = paths
            .filter(p => p.path.includes(common_types_1.pathJoin(company.dbPath, "employees")))
            .pop();
        expect(pathWithFkRef.value).to.equal("microsoft");
        expect(pathWithInverseRef.path).to.include(person.id);
        expect(pathWithInverseRef.value).to.equal(true);
    });
    it("can build composite key from FK string", async () => {
        const t1 = createCompositeKeyFromFkString_1.createCompositeKeyFromFkString("foo::geo:CT::age:13");
        expect(t1.id).to.equal("foo");
        expect(t1.geo).to.equal("CT");
        expect(t1.age).to.equal("13");
        const t2 = createCompositeKeyFromFkString_1.createCompositeKeyFromFkString("foo");
        expect(t2.id).to.equal("foo");
        expect(Object.keys(t2)).to.have.lengthOf(1);
    });
    it("can build TYPED composite key from Fk string and reference model", async () => {
        const t1 = createCompositeKeyFromFkString_1.createCompositeKeyFromFkString("foo::age:13", Person_1.Person);
        expect(t1.id).to.equal("foo");
        expect(t1.age).to.equal(13);
    });
    it("building a TYPED composite key errors when invalid property is introduced", async () => {
        try {
            const t1 = createCompositeKeyFromFkString_1.createCompositeKeyFromFkString("foo::age:13::geo:CT", Person_1.Person);
            throw new Error("Should not reach this point because of invalid prop");
        }
        catch (e) {
            expect(e.firemodel).to.equal(true);
            expect(e.code).to.equal("property-does-not-exist");
        }
    });
    it("build relationship paths for M:1 (with one-way directionality)", async () => {
        const person = src_1.Record.createWith(Person_1.Person, { id: "joe", name: "joe" });
        const father = src_1.Record.createWith(Person_1.Person, { id: "abcdef", name: "poppy" });
        const paths = buildRelationshipPaths_1.buildRelationshipPaths(person, "father", "abcdef");
        expect(paths.map(i => i.path)).to.include(common_types_1.pathJoin(father.dbPath, "children", person.id));
    });
    it.skip("building relationship paths that point to non-existing records throws error when option is set", async () => {
        throw new Error("test not written");
    });
    it("build paths 1:M", async () => {
        const person = src_1.Record.createWith(FancyPerson_1.FancyPerson, {
            id: "fancy-bob",
            name: "Bob",
            age: 23
        });
        const car = src_1.Record.createWith(Car_1.Car, "12345");
        const paths = buildRelationshipPaths_1.buildRelationshipPaths(person, "cars", "12345");
        const personFkToCars = common_types_1.pathJoin(person.dbPath, "cars", "12345");
        const carToOwner = common_types_1.pathJoin(car.dbPath, "owner");
        expect(paths.map(p => p.path)).to.include(personFkToCars);
        expect(paths.map(p => p.path)).to.include(carToOwner);
    });
    it("build paths 1:M (with dynamic offset)", async () => {
        const person = src_1.Record.createWith(DeepPerson_1.default, "bob-marley::group:musicians");
        const carId = "my-car::vendor:Chevy";
        const car = src_1.Record.createWith(Car_2.default, carId);
        const paths = buildRelationshipPaths_1.buildRelationshipPaths(person, "cars", carId);
        const personFkToCars = common_types_1.pathJoin(person.dbPath, "cars", carId);
        const carToOwner = common_types_1.pathJoin(car.dbPath, "owners", person.compositeKeyRef);
        expect(paths.map(p => p.path)).to.include(personFkToCars);
        expect(paths.map(p => p.path)).to.include(carToOwner);
    });
    it("using addToRelationship() on a hasMany (M:1) relationship updates DB and sends events", async () => {
        const person = await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob",
            age: 23
        });
        expect(person.id).to.exist.and.to.be.a("string");
        const lastUpdated = person.data.lastUpdated;
        const events = [];
        src_1.Record.dispatch = (evt) => events.push(evt);
        await person.addToRelationship("cars", "12345");
        const eventTypes = Array.from(new Set(events.map(e => e.type)));
        expect(eventTypes).includes(state_mgmt_1.FmEvents.RELATIONSHIP_ADDED_LOCALLY);
        expect(eventTypes).includes(state_mgmt_1.FmEvents.RELATIONSHIP_ADDED_CONFIRMATION);
        const p = await src_1.Record.get(FancyPerson_1.FancyPerson, person.id);
        expect(Object.keys(p.data.cars)).to.include("12345");
        const c = await src_1.Record.get(Car_1.Car, "12345");
        expect(c.data.owner).to.include(person.id);
    });
    it("using addToRelationship in a M:M relationship", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(Person_1.Person, {
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        const pay = await src_1.Record.add(Pay_1.Pay, {
            amount: "2400.00"
        });
        await company.addToRelationship("employees", person.id);
        await person.addToRelationship("pays", pay.id);
        expect(company.data.employees[person.id]).to.equal(true);
    });
    it("testing adding relationships with associate", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(Person_1.Person, {
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        const person2 = await src_1.Record.add(Person_1.Person, {
            name: "Jane Bloggs",
            age: 24,
            gender: "female"
        });
        const pay = await src_1.Record.add(Pay_1.Pay, {
            amount: "2400.00"
        });
        await company.associate("employees", person.id);
        await person.associate("pays", pay.id);
        await company.addToRelationship("employees", [person.id, person2.id]);
        await company.associate("employees", [person.id, person2.id]);
        expect(company.data.employees[person.id]).to.equal(true);
    });
    it("testing removing relationships with disassociate()", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(Person_1.Person, {
            id: "p1",
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        const person2 = await src_1.Record.add(Person_1.Person, {
            id: "p2",
            name: "Jane Bloggs",
            age: 24,
            gender: "female"
        });
        const pay = await src_1.Record.add(Pay_1.Pay, {
            amount: "2400.00"
        });
        await person.associate("pays", pay.id);
        await company.associate("employees", [person.id, person2.id]);
        await company.disassociate("employees", person2.id);
        await person.disassociate("pays", pay.id);
        expect(company.data.employees[person.id]).to.equal(true);
        expect(company.data.employees[person2.id]).to.not.equal(true);
        expect(person.data.pays[pay.id]).to.not.equal(true);
    });
    it("testing it should throw an error when incorrect refs is passed in with associate", async () => {
        const company = await src_1.Record.add(Company_1.Company, {
            name: "Acme Inc",
            founded: "1992"
        });
        const person = await src_1.Record.add(Person_1.Person, {
            name: "Joe Bloggs",
            age: 22,
            gender: "male"
        });
        try {
            await person.associate("company", [company.id]);
            expect(false, "passing array as refs is not allowed with hasOne!");
        }
        catch (e) {
            expect(e.message).to.equal("Ref -LYdV5fhRmiGWXwdAWSg must not be an array of strings.");
        }
    });
    // it.skip("using addToRelationship() on a hasMany relationship with an inverse of hasOne", async () => {
    //   const person = await Record.add(Person, {
    //     name: "Bob",
    //     age: 23
    //   });
    //   expect(person.id).to.exist.and.to.be.a("string");
    //   const lastUpdated = person.data.lastUpdated;
    //   const events: IFmRecordEvent[] = [];
    //   Record.dispatch = (evt: IFmRecordEvent) => events.push(evt);
    //   await person.addToRelationship("concerts", "12345");
    //   expect((person.data.concerts as any)["12345"]).to.equal(true);
    //   expect(events).to.have.lengthOf(2);
    //   const eventTypes = new Set(events.map(e => e.type));
    //   expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED)).to.equal(true);
    //   expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED_LOCALLY)).to.equal(true);
    // });
}).timeout(4000);
//# sourceMappingURL=relationship-spec.js.map