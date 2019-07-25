"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const fakeIt_1 = __importDefault(require("../src/Mock/fakeIt"));
const firemock_1 = require("firemock");
const chai_1 = require("chai");
const abstracted_admin_1 = require("abstracted-admin");
const src_1 = require("../src");
const Product_1 = require("./testing/Product");
const helper = new firemock_1.MockHelper();
describe("Test parameterized mock built-in fakes", () => {
    before(async () => {
        await firemock_1.Mock.prepare();
    });
    it("number min/max works", () => {
        for (let i = 0; i < 100; i++) {
            const val = fakeIt_1.default(helper, "number", { min: 1, max: 10 });
            chai_1.expect(val)
                .to.be.greaterThan(0)
                .and.lessThan(11);
            chai_1.expect(val).to.equal(Math.floor(val));
        }
    });
    it("number min/max works with negatives", () => {
        for (let i = 0; i < 100; i++) {
            const val = fakeIt_1.default(helper, "number", { min: -10, max: 0 });
            chai_1.expect(val)
                .to.be.greaterThan(-11)
                .and.lessThan(1);
            chai_1.expect(val).to.equal(Math.floor(val));
        }
    });
    it.skip("number precision 0 works", () => {
        for (let i = 0; i < 100; i++) {
            const val = fakeIt_1.default(helper, "number", { min: 1, max: 10, precision: 0 });
            chai_1.expect(val).to.equal(Math.floor(val));
        }
    });
    it.skip("number precision 1 works", () => {
        for (let i = 0; i < 100; i++) {
            const val = fakeIt_1.default(helper, "number", {
                min: 1,
                max: 10,
                precision: 0.01
            });
            const rightOfDecimal = String(val).replace(/.*\./, "");
        }
    });
    it("price min/max works, currency symbol defaults to $", () => {
        for (let i = 0; i < 100; i++) {
            const val = fakeIt_1.default(helper, "price", { min: 1, max: 100 });
            const amt = Number(val.replace("$", "").replace(".00", ""));
            chai_1.expect(val).to.be.a("string");
            chai_1.expect(val.slice(0, 1)).to.equal("$");
            chai_1.expect(amt)
                .to.be.greaterThan(0)
                .and.lessThan(101);
        }
    });
    it("price symbol can be overwritten", () => {
        for (let i = 0; i < 10; i++) {
            const val = fakeIt_1.default(helper, "price", { min: 1, max: 100, symbol: "£" });
            chai_1.expect(val.slice(0, 1)).to.equal("£");
        }
    });
    it("cents are always .00 by default", () => {
        for (let i = 0; i < 10; i++) {
            const val = fakeIt_1.default(helper, "price", { min: 1, max: 100 });
            const cents = val.replace(/.*\./, "");
            chai_1.expect(cents).to.equal("00");
        }
    });
    it('cents can be made variable by setting "variableCents" to true', () => {
        const totals = {
            zeros: 0,
            nines: 0,
            others: 0
        };
        for (let i = 0; i < 1000; i++) {
            const val = fakeIt_1.default(helper, "price", {
                min: 1,
                max: 100,
                variableCents: true
            });
            const cents = val.replace(/.*\./, "");
            chai_1.expect(cents).to.have.lengthOf(2);
            if (cents === "00") {
                totals.zeros++;
            }
            else if (cents === "99") {
                totals.nines++;
            }
            else {
                totals.others++;
            }
        }
        chai_1.expect(totals.zeros).to.be.greaterThan(0);
        chai_1.expect(totals.nines).to.be.greaterThan(0);
        chai_1.expect(totals.others).to.be.greaterThan(0);
    });
    it("Distribution works as expected", async () => {
        const totals = { often: 0, rarely: 0, almostNever: 0 };
        for (let i = 0; i < 3000; i++) {
            const val = fakeIt_1.default(helper, "distribution", [1, "almostNever"], [9, "rarely"], [90, "often"]);
            chai_1.expect(["often", "rarely", "almostNever"]).to.include(val);
            totals[val]++;
        }
        chai_1.expect(totals.often).to.be.greaterThan(totals.rarely);
        chai_1.expect(totals.rarely).to.be.greaterThan(totals.almostNever);
    });
    it("datePastString returns a proper string notation", async () => {
        const response = fakeIt_1.default(helper, "datePastString");
        chai_1.expect(response).to.be.a("string");
        chai_1.expect(response.replace(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/, "replaced")).to.equal("replaced");
    });
    it("number mocks can set a max and min value which will be respected", async () => {
        for (let i = 0; i < 100; i++) {
            const response = fakeIt_1.default(helper, "number", { min: 1, max: 25 });
            chai_1.expect(response)
                .to.be.greaterThan(0)
                .and.lessThan(26);
        }
        for (let i = 0; i < 100; i++) {
            const response = fakeIt_1.default(helper, "number", { min: 50, max: 99 });
            chai_1.expect(response)
                .to.be.greaterThan(49)
                .and.lessThan(100);
        }
        // Now let's do the test in a more "real world" situation
        src_1.FireModel.defaultDb = await abstracted_admin_1.DB.connect({ mocking: true });
        await src_1.Mock(Product_1.Product).generate(10);
        const people = await src_1.List.all(Product_1.Product);
        people.forEach(p => {
            chai_1.expect(p.minCost)
                .to.be.greaterThan(9)
                .and.lessThan(101);
        });
    });
});
//# sourceMappingURL=mock-fake-spec.js.map