import { Mock as FireMock, MockHelper } from "firemock";
import { FireModel, List, Mock } from "../src";

import { Product } from "./testing/Product";
// import { DB, SDK } from "universal-fire";
import { RealTimeAdmin } from "@forest-fire/real-time-admin";
import { fakeIt } from "@/index";

const helper = new MockHelper();

describe("Test parameterized mock built-in fakes", () => {
  beforeAll(async () => {
    await FireMock.prepare();
  });

  it("number min/max works", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", { min: 1, max: 10 });
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThan(11);
      expect(val).toBe(Math.floor(val));
    }
  });

  it("number min/max works with negatives", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", { min: -10, max: 0 });
      expect(val).toBeGreaterThan(-11);
      expect(val).toBeLessThan(1);
      expect(val).toBe(Math.floor(val));
    }
  });

  it("number precision 0 works", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", { min: 1, max: 10, precision: 0 });

      expect(val).toBe(Math.floor(val));
    }
  });

  it.skip("number precision 1 works", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "number", {
        min: 1,
        max: 10,
        precision: 0.01,
      });

      const rightOfDecimal = String(val).replace(/.*\./, "");
    }
  });

  it("price min/max works, currency symbol defaults to $", () => {
    for (let i = 0; i < 100; i++) {
      const val = fakeIt(helper, "price", { min: 1, max: 100 });
      const amt = Number(val.replace("$", "").replace(".00", ""));
      expect(val).toBeString();
      expect(val.slice(0, 1)).toBe("$");
      expect(amt).toBeGreaterThan(0);
      expect(amt).toBeLessThan(101);
    }
  });

  it("price symbol can be overwritten", () => {
    for (let i = 0; i < 10; i++) {
      const val = fakeIt(helper, "price", { min: 1, max: 100, symbol: "£" });

      expect(val.slice(0, 1)).toBe("£");
    }
  });

  it("cents are always .00 by default", () => {
    for (let i = 0; i < 10; i++) {
      const val = fakeIt(helper, "price", { min: 1, max: 100 });
      const cents = val.replace(/.*\./, "");
      expect(cents).toBe("00");
    }
  });

  it('cents can be made variable by setting "variableCents" to true', () => {
    const totals = {
      zeros: 0,
      nines: 0,
      others: 0,
    };
    for (let i = 0; i < 1000; i++) {
      const val = fakeIt(helper, "price", {
        min: 1,
        max: 100,
        variableCents: true,
      });
      const cents = val.replace(/.*\./, "");
      expect(cents).toHaveLength(2);
      if (cents === "00") {
        totals.zeros++;
      } else if (cents === "99") {
        totals.nines++;
      } else {
        totals.others++;
      }
    }

    expect(totals.zeros).toBeGreaterThan(0);
    expect(totals.nines).toBeGreaterThan(0);
    expect(totals.others).toBeGreaterThan(0);
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
      expect(["often", "rarely", "almostNever"]).toEqual(
        expect.arrayContaining([val])
      );
      totals[val as keyof typeof totals]++;
    }

    expect(totals.often).toBeGreaterThan(totals.rarely);
    expect(totals.rarely).toBeGreaterThan(totals.almostNever);
  });

  it("datePastString returns a proper string notation", async () => {
    const response = fakeIt(helper, "datePastString");
    expect(response).toBeString();
    expect(response.replace(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/, "replaced")).toBe(
      "replaced"
    );
  });

  it("number mocks can set a max and min value which will be respected", async () => {
    for (let i = 0; i < 100; i++) {
      const response = fakeIt(helper, "number", { min: 1, max: 25 });
      expect(response).toBeGreaterThan(0);
      expect(response).toBeLessThan(26);
    }

    for (let i = 0; i < 100; i++) {
      const response = fakeIt(helper, "number", { min: 50, max: 99 });
      expect(response).toBeGreaterThan(49);
      expect(response).toBeLessThan(100);
    }

    // Now let's do the test in a more "real world" situation
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
    await Mock(Product).generate(10);
    const people = await List.all(Product);
    people.forEach((p) => {
      expect(p.minCost).toBeGreaterThan(9);
      expect(p.minCost).toBeLessThan(101);
    });
  });
});
