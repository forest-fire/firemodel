import { model, Model, property, ownedBy, fk, hasMany } from "../../src";
import { mock } from "../../src/decorators/property";
import { Company } from "./company";
import { Car } from "./Car";

function bespokeMock(context: import("firemock").MockHelper) {
  return context.faker.name.firstName() + ", hello to you";
}

@model({})
export class FancyPerson extends Model {
  @property public name: string;
  @property public age: number;
  @property public phoneNumber: string;
  // prettier-ignore
  @property @mock("phoneNumber") public otherPhone: string;
  // prettier-ignore
  @property @mock(bespokeMock) public foobar: string;
  @ownedBy(Company) public employer: string;
  @hasMany(Car) public cars: fk[];
}
