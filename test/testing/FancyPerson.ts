import {
  model,
  Model,
  property,
  ownedBy,
  fk,
  hasMany,
  length,
  min,
  max,
  pushKey,
  inverse
} from "../../src";
import { mock } from "../../src/decorators/property";
import { Company } from "./company";
import { Car } from "./Car";
import { IDictionary } from "common-types";
import { Person } from "./person";

function bespokeMock(context: import("firemock").MockHelper) {
  return context.faker.name.firstName() + ", hello to you";
}

@model({ dbOffset: "authenticated" })
export class FancyPerson extends Model {
  @property public name: string;
  // prettier-ignore
  @property @min(0) public age?: number;
  @property public phoneNumber?: string;
  // prettier-ignore
  @property @mock("phoneNumber") public otherPhone?: string;
  // prettier-ignore
  @property @mock(bespokeMock) public foobar?: string;
  @ownedBy(Company) public employer?: fk;
  @hasMany(Car) public cars?: fk[];
}
