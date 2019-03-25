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
const FancyPerson_1 = require("./testing/FancyPerson");
const Car_1 = require("./testing/Car");
const Company_1 = require("./testing/Company");
const expect = chai.expect;
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
    beforeEach(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.List.defaultDb = db;
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
        await Mock_1.Mock(FancyPerson_1.FancyPerson, db).generate(10);
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
        const numberOfFolks = 1;
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
    it("Mocking data does not fire initial RECORD_ADD_LOCALLY record to dispatch", async () => {
        throw new Error("test not written");
    });
    it.only("Mocking data does get picked up by watchers and has correct meta data", async () => {
        // missind plural name and localPath is not plural
        const events = [];
        src_1.FireModel.dispatch = (e) => events.push(e);
        // const w = await Watch.list(FancyPerson).all();
        // console.log(w);
        await Mock_1.Mock(FancyPerson_1.FancyPerson).generate(1);
        console.log(events);
    });
});
//# sourceMappingURL=mock-spec.js.map