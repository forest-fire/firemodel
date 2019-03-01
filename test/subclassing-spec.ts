// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
import { UserProfile } from "./testing/subClassing/UserProfile";
import { Customer } from "./testing/subClassing/Customer";
import { Record } from "../src";
const expect = chai.expect;

describe.only("Subclassing Models", () => {
  it("Subclass has own props", async () => {
    const customer = Record.create(Customer);
    const properties = customer.META.properties.map(p => p.property);
    console.log(properties);

    expect(properties).to.include("currentDeliveryAddress");
    expect(properties).to.include("priorDeliveryAddress");
  });

  it.only("Subclass has parents props", async () => {
    const customer = Record.create(Customer);
    const properties = customer.META.properties.map(p => p.property);
    console.log(properties);

    expect(properties).to.include("name");
    expect(properties).to.include("uid");
  });

  it("Subclass has base Model props", async () => {
    const customer = Record.create(Customer);
    const properties = customer.META.properties.map(p => p.property);
    console.log(properties);

    expect(properties).to.include("id");
    expect(properties).to.include("lastUpdated");
    expect(properties).to.include("createdAt");
  });
});
