// import { DB, SDK } from "universal-fire";

// tslint:disable:no-implicit-dependencies
import { FireModel, List, Mock, Record } from "../src";

import { Person } from "./testing/default-values/Person";
import { RealTimeAdmin } from "universal-fire";
import { expect } from "chai";

describe("defaultValue() → ", () => {
  before(async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("defaultValue is used when not set with add()", async () => {
    const p = await Record.add(Person, {
      age: 34,
    });
    expect(p.data.age).is.equal(34);
    expect(p.data.currentDeliveryAddress).is.equal("home");
    expect(p.data.priorDeliveryAddress).is.equal("work");
  });

  it("defaultValue is ignored when not set with add()", async () => {
    const p = await Record.add(Person, {
      age: 34,
      priorDeliveryAddress: "foo",
    });
    expect(p.data.age).is.equal(34);
    expect(p.data.currentDeliveryAddress).is.equal("home");
    expect(p.data.priorDeliveryAddress).is.equal("foo");
  });

  // TODO: Look at this test, it is exhibiting odd async behaviour
  it.skip("mocking ignores defaultValue", async () => {
    await Mock(Person).generate(10);
    const people = await List.all(Person);
    people.map((person) => {
      expect(person.currentDeliveryAddress).to.equal("work");
      expect(person.priorDeliveryAddress).to.equal("home");
    });
  });
});
