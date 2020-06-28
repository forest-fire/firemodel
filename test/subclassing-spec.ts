import { Customer } from "./testing/subClassing/Customer";
import { Record } from "../src";

describe("Subclassing Models", () => {
  it("Subclass has own props", async () => {
    const customer = Record.create(Customer);
    const properties = customer.META.properties.map((p) => p.property);

    expect(properties).toEqual(
      expect.arrayContaining(["currentDeliveryAddress"])
    );
    expect(properties).toEqual(
      expect.arrayContaining(["priorDeliveryAddress"])
    );
  });

  it("Subclass has parents props", async () => {
    const customer = Record.create(Customer);
    const properties = customer.META.properties.map((p) => p.property);

    expect(properties).toEqual(expect.arrayContaining(["name"]));
    expect(properties).toEqual(expect.arrayContaining(["uid"]));
  });

  it("Subclass has base Model props", async () => {
    const customer = Record.create(Customer);
    const properties = customer.META.properties.map((p) => p.property);

    expect(properties).toEqual(expect.arrayContaining(["id"]));
    expect(properties).toEqual(expect.arrayContaining(["lastUpdated"]));
    expect(properties).toEqual(expect.arrayContaining(["createdAt"]));
  });
});
