import { FireModel, List, Mock, Record } from "../src";

import { Person } from "./testing/default-values/Person";
import { RealTimeAdmin } from "universal-fire";

describe("defaultValue() → ", () => {
  beforeAll(async () => {
    const db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("defaultValue is used when not set with add()", async () => {
    const p = await Record.add(Person, {
      age: 34,
    });
    expect(p.data.age).toBe(34);
    expect(p.data.currentDeliveryAddress).toBe("home");
    expect(p.data.priorDeliveryAddress).toBe("work");
  });

  it("defaultValue is ignored when not set with add()", async () => {
    const p = await Record.add(Person, {
      age: 34,
      priorDeliveryAddress: "foo",
    });
    expect(p.data.age).toBe(34);
    expect(p.data.currentDeliveryAddress).toBe("home");
    expect(p.data.priorDeliveryAddress).toBe("foo");
  });

  // TODO: Look at this test, it is exhibiting odd async behaviour
  it("mocking ignores defaultValue", async () => {
    await Mock(Person).generate(10);
    const people = await List.all(Person);
    people.map((person) => {
      expect(person.currentDeliveryAddress).toBe("work");
      expect(person.priorDeliveryAddress).toBe("home");
    });
  });
});
