// tslint:disable:no-implicit-dependencies
import fakeIt from "../src/Mock/fakeIt";
import { Mock as FireMock, MockHelper } from "firemock";
import { expect } from "chai";
import { DB } from "abstracted-admin";
import { Mock, FireModel, List } from "../src";
import { Product } from "./testing/Product";

const helper = new MockHelper();

describe("Test parameterized mock built-in fakes", () => {
  before(async () => {
    await FireMock.prepare();
  });

  it("number min/max works", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", { min: 1, max: 10 });
      expect(val)
        .to.be.greaterThan(0)
        .and.lessThan(11);
      expect(val).to.equal(Math.floor(val));
    }
  });

  it("number min/max works with negatives", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", { min: -10, max: 0 });
      expect(val)
        .to.be.greaterThan(-11)
        .and.lessThan(1);
      expect(val).to.equal(Math.floor(val));
    }
  });

  it.skip("number precision 0 works", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", { min: 1, max: 10, precision: 0 });

      expect(val).to.equal(Math.floor(val));
    }
  });

  it.skip("number precision 1 works", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", {
        min: 1,
        max: 10,
        precision: 0.01
      });

      const rightOfDecimal = String(val).replace(/.*\./, "");
    }
  });

  it("price min/max works, currency symbol defaults to $", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "price", { min: 1, max: 100 });
      const amt = Number(val.replace("$", "").replace(".00", ""));
      expect(val).to.be.a("string");
      expect(val.slice(0, 1)).to.equal("$");
      expect(amt)
        .to.be.greaterThan(0)
        .and.lessThan(101);
    }
  });

  it("price symbol can be overwritten", () => {
    for (let i = 0; i < 10; i++) {
      const val = fakeIt(helper, "price", { min: 1, max: 100, symbol: "£" });

      expect(val.slice(0, 1)).to.equal("£");
    }
  });

  it("cents are always .00 by default", () => {
    for (let i = 0; i < 10; i++) {
      const val = fakeIt(helper, "price", { min: 1, max: 100 });
      const cents = val.replace(/.*\./, "");
      expect(cents).to.equal("00");
    }
  });

  it('cents can be made variable by setting "variableCents" to true', () => {
    const totals = {
      zeros: 0,
      nines: 0,
      others: 0
    };
    for (let i = 0; i < 1000; i++) {
      const val = fakeIt(helper, "price", {
        min: 1,
        max: 100,
        variableCents: true
      });
      const cents = val.replace(/.*\./, "");
      expect(cents).to.have.lengthOf(2);
      if (cents === "00") {
        totals.zeros++;
      } else if (cents === "99") {
        totals.nines++;
      } else {
        totals.others++;
      }
    }

    expect(totals.zeros).to.be.greaterThan(0);
    expect(totals.nines).to.be.greaterThan(0);
    expect(totals.others).to.be.greaterThan(0);
  });

  it("Distribution works as expected", async () => {
    const totals = { often: 0, rarely: 0, almostNever: 0 };
    for (let i = 0; i < 3000; i++) {
      const val = fakeIt(
        helper,
        "distribution",
        [1, "almostNever"],
        [9, "rarely"],
        [90, "often"]
      );
      expect(["often", "rarely", "almostNever"]).to.include(val);
      totals[val as keyof typeof totals]++;
    }

    expect(totals.often).to.be.greaterThan(totals.rarely);
    expect(totals.rarely).to.be.greaterThan(totals.almostNever);
  });

  it("datePastString returns a proper string notation", async () => {
    const response = fakeIt(helper, "datePastString");
    expect(response).to.be.a("string");
    expect(
      response.replace(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/, "replaced")
    ).to.equal("replaced");
  });

  it("number mocks can set a max and min value which will be respected", async () => {
    for (let i = 0; i < 100; i++) {
      const response = fakeIt(helper, "number", { min: 1, max: 25 });
      expect(response)
        .to.be.greaterThan(0)
        .and.lessThan(26);
    }

    for (let i = 0; i < 100; i++) {
      const response = fakeIt(helper, "number", { min: 50, max: 99 });
      expect(response)
        .to.be.greaterThan(49)
        .and.lessThan(100);
    }

    // Now let's do the test in a more "real world" situation
    FireModel.defaultDb = await DB.connect({ mocking: true });
    await Mock(Product).generate(10);
    const people = await List.all(Product);
    people.forEach(p => {
      expect(p.minCost)
        .to.be.greaterThan(9)
        .and.lessThan(101);
    });
  });
});
