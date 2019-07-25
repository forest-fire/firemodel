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
const AuditedPerson_1 = require("./testing/AuditedPerson");
const src_1 = require("../src");
const Car_1 = require("./testing/Car");
const expect = chai.expect;
describe("DB Indexes →", () => {
    it("Model shows indexes as expected on Model with no additional indexes", async () => {
        const person = src_1.Record.create(AuditedPerson_1.Person);
        expect(person.META.dbIndexes)
            .is.an("array")
            .and.has.lengthOf(3);
        const expected = ["id", "lastUpdated", "createdAt"];
        person.META.dbIndexes.map(i => expect(expected.includes(i.property)).to.equal(true));
    });
    it("Model shows indexes as expected on Model with additional indexes", async () => {
        const car = src_1.Record.create(Car_1.Car);
        expect(car.META.dbIndexes)
            .is.an("array")
            .and.has.lengthOf(4);
        const expected = ["id", "lastUpdated", "createdAt", "modelYear"];
        car.META.dbIndexes.map(i => expect(expected.includes(i.property)).to.equal(true));
    });
});
//# sourceMappingURL=indexes-spec.js.map