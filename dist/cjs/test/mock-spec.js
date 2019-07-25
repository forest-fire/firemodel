"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const Mock_1 = require("../src/Mock");
const firemock_1 = require("firemock");
const FancyPerson_1 = require("./testing/FancyPerson");
const Car_1 = require("./testing/Car");
const Company_1 = require("./testing/Company");
const common_types_1 = require("common-types");
const helpers = __importStar(require("./testing/helpers"));
const expect = chai.expect;
helpers.setupEnv();
let SimplePerson = class SimplePerson extends src_1.Model {
};
__decorate([
    src_1.property,
    __metadata("design:type", String)
], SimplePerson.prototype, "name", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", Number)
], SimplePerson.prototype, "age", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], SimplePerson.prototype, "phoneNumber", void 0);
SimplePerson = __decorate([
    src_1.model({})
], SimplePerson);
exports.SimplePerson = SimplePerson;
describe("Mocking:", () => {
    let db;
    let realDb;
    before(async () => {
        realDb = await abstracted_admin_1.DB.connect();
    });
    after(async () => {
        const fancy = src_1.Record.create(FancyPerson_1.FancyPerson);
        await realDb.remove(fancy.dbOffset);
    });
    beforeEach(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.FireModel.defaultDb = db;
    });
    it("FireMock.prepare() leads to immediate availability of faker library", async () => {
        const m = await firemock_1.Mock.prepare();
        expect(m.faker).is.a("object");
        expect(m.faker.address.city).is.a("function");
    });
    it("the auto-mock works for named properties", async () => {
        await Mock_1.Mock(SimplePerson, db).generate(10);
        const people = await src_1.List.all(SimplePerson);
        expect(people).to.have.lengthOf(10);
        people.map(person => {
            expect(person.age)
                .to.be.a("number")
                .greaterThan(0)
                .lessThan(101);
        });
    });
    it("giving a @mock named hint corrects the typing of a named prop", async () => {
        const m = await Mock_1.Mock(FancyPerson_1.FancyPerson, db).generate(10);
        const people = await src_1.List.all(FancyPerson_1.FancyPerson);
        expect(people).to.have.lengthOf(10);
        people.map(person => {
            expect(person.otherPhone).to.be.a("string");
            expect(/[\.\(-]/.test(person.otherPhone)).to.equal(true);
        });
    });
    it("passing in a function to @mock produces expected results", async () => {
        await Mock_1.Mock(FancyPerson_1.FancyPerson, db).generate(10);
        const people = await src_1.List.all(FancyPerson_1.FancyPerson);
        expect(people).to.have.lengthOf(10);
        people.map(person => {
            expect(person.foobar).to.be.a("string");
            expect(person.foobar).to.contain("hello");
        });
    });
    it("using createRelationshipLinks() sets fake links to all relns", async () => {
        const numberOfFolks = 2;
        await Mock_1.Mock(FancyPerson_1.FancyPerson, db)
            .createRelationshipLinks()
            .generate(numberOfFolks);
        const people = await src_1.List.all(FancyPerson_1.FancyPerson);
        expect(people).to.have.lengthOf(numberOfFolks);
        people.map(person => {
            expect(person.employer).to.be.a("string");
            expect(person.cars).to.be.an("object");
        });
    });
    it("using followRelationshipLinks() sets links and adds those models", async () => {
        const numberOfFolks = 10;
        try {
            await Mock_1.Mock(FancyPerson_1.FancyPerson, db)
                .followRelationshipLinks()
                .generate(numberOfFolks);
        }
        catch (e) {
            console.error(e.errors);
            throw e;
        }
        const people = await src_1.List.all(FancyPerson_1.FancyPerson);
        const cars = await src_1.List.all(Car_1.Car);
        const company = await src_1.List.all(Company_1.Company);
        expect(cars.length).to.equal(numberOfFolks * 2);
        expect(company.length).to.equal(numberOfFolks);
        expect(people).to.have.lengthOf(numberOfFolks * 5);
        const carIds = cars.map(car => car.id);
        carIds.map(id => people.findWhere("cars", id));
        const companyIds = company.map(c => c.id);
        companyIds.map(id => people.findWhere("employer", id));
    });
    it("using a specific config for createRelationshipLinks works as expected", async () => {
        const numberOfFolks = 25;
        await Mock_1.Mock(FancyPerson_1.FancyPerson, db)
            .followRelationshipLinks({
            cars: [3, 5]
        })
            .generate(numberOfFolks);
        const people = await src_1.List.all(FancyPerson_1.FancyPerson);
        expect(people).to.have.lengthOf(numberOfFolks);
    });
    it("Adding a record fires local events as expected", async () => {
        const events = [];
        src_1.FireModel.dispatch = (e) => events.push(e);
        await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob Barker"
        });
        const types = events.map(e => e.type);
        expect(types).to.include(src_1.FmEvents.RECORD_ADDED_LOCALLY);
        expect(types).to.include(src_1.FmEvents.RECORD_ADDED_CONFIRMATION);
    });
    it("Mocking data does not fire fire local events (RECORD_ADD_LOCALLY, RECORD_ADD_CONFIRMATION) to dispatch", async () => {
        const events = [];
        src_1.FireModel.dispatch = (e) => events.push(e);
        await Mock_1.Mock(FancyPerson_1.FancyPerson).generate(10);
        expect(events).to.have.lengthOf(0);
    });
    it("Adding a record with {silent: true} raises an error in real db", async () => {
        src_1.FireModel.defaultDb = realDb;
        const events = [];
        src_1.FireModel.dispatch = (e) => events.push(e);
        try {
            await src_1.Record.add(FancyPerson_1.FancyPerson, {
                name: "Bob Barker"
            }, { silent: true });
        }
        catch (e) {
            expect(e.code).to.equal("forbidden");
        }
    });
    it("Adding a record with a watcher fires both watcher event and LOCAL events [ real db ]", async () => {
        src_1.FireModel.defaultDb = realDb;
        const events = [];
        src_1.FireModel.dispatch = (e) => events.push(e);
        const w = await src_1.Watch.list(FancyPerson_1.FancyPerson)
            .all()
            .start();
        // await Mock(FancyPerson).generate(1);
        await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob Barker"
        });
        await common_types_1.wait(5); // ensures that DB event has time to fire
        const eventTypes = new Set();
        events.forEach(e => eventTypes.add(e.type));
        expect(Array.from(eventTypes)).to.include(src_1.FmEvents.RECORD_ADDED);
        expect(Array.from(eventTypes)).to.include("@firemodel/RECORD_ADDED_LOCALLY");
        expect(Array.from(eventTypes)).to.include("@firemodel/RECORD_ADDED_CONFIRMATION");
        const locally = events.find(e => e.type === src_1.FmEvents.RECORD_ADDED_LOCALLY);
        const confirm = events.find(e => e.type === src_1.FmEvents.RECORD_ADDED_CONFIRMATION);
        expect(locally).to.haveOwnProperty("transactionId");
        expect(confirm).to.haveOwnProperty("transactionId");
        expect(locally.transactionId).to.equal(confirm.transactionId);
    });
    it("Mocking data does NOT fire watcher events but adding a record DOES [ mock db ]", async () => {
        const events = [];
        src_1.FireModel.dispatch = (e) => {
            events.push(e);
        };
        const w = await src_1.Watch.list(FancyPerson_1.FancyPerson)
            .all()
            .start({ name: "my-test-watcher" });
        await Mock_1.Mock(FancyPerson_1.FancyPerson).generate(1);
        const eventTypes = new Set(events.map(e => e.type));
        expect(Array.from(eventTypes)).to.not.include(src_1.FmEvents.RECORD_ADDED);
        await src_1.Record.add(FancyPerson_1.FancyPerson, {
            name: "Bob the Builder"
        });
        const eventTypes2 = Array.from(new Set(events.map(e => e.type)));
        expect(eventTypes2).to.include(src_1.FmEvents.RECORD_ADDED);
    });
    it.skip("Updating a record with values which are unchanged does NOT fire a server watch event", async () => {
        //
    });
});
//# sourceMappingURL=mock-spec.js.map