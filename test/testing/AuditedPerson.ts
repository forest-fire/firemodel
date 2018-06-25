import {
  model,
  Model,
  property,
  ownedBy,
  fk,
  hasMany,
  min,
  inverse
} from "../../src";
import { mock } from "../../src/decorators/property";
import { Company } from "./company";

function bespokeMock(context: import("firemock").MockHelper) {
  return context.faker.name.firstName() + ", hello to you";
}

@model({ dbOffset: "authenticated", audit: true })
export class Person extends Model {
  @property public name: string;
  // prettier-ignore
  @property @min(0) public age?: number;
  @property public phoneNumber?: string;
  // prettier-ignore
  @property @mock("phoneNumber") public otherPhone?: string;
  // prettier-ignore
  @property @mock(bespokeMock) public foobar?: string;
  // prettier-ignore
  @ownedBy(Company) public employer?: fk;
  // prettier-ignore
  @hasMany(Person) @inverse("children") public parents?: fk[];
  // prettier-ignore
  @hasMany(Person) @inverse("parents") public children?: fk[];
}
