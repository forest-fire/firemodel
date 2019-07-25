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
const Customer_1 = require("./testing/subClassing/Customer");
const src_1 = require("../src");
const expect = chai.expect;
describe("Subclassing Models", () => {
    it("Subclass has own props", async () => {
        const customer = src_1.Record.create(Customer_1.Customer);
        const properties = customer.META.properties.map(p => p.property);
        expect(properties).to.include("currentDeliveryAddress");
        expect(properties).to.include("priorDeliveryAddress");
    });
    it("Subclass has parents props", async () => {
        const customer = src_1.Record.create(Customer_1.Customer);
        const properties = customer.META.properties.map(p => p.property);
        expect(properties).to.include("name");
        expect(properties).to.include("uid");
    });
    it("Subclass has base Model props", async () => {
        const customer = src_1.Record.create(Customer_1.Customer);
        const properties = customer.META.properties.map(p => p.property);
        expect(properties).to.include("id");
        expect(properties).to.include("lastUpdated");
        expect(properties).to.include("createdAt");
    });
});
//# sourceMappingURL=subclassing-spec.js.map