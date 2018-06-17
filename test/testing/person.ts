import {
  Model,
  property,
  constrainedProperty,
  constrain,
  desc,
  min,
  max,
  length,
  model,
  fk,
  ownedBy,
  hasMany,
  inverse
} from "../../src";
import { Company } from "./company";
import { IDictionary } from "common-types";
import { pushKey } from "../../src/decorators/property";
import { FancyPerson } from "./FancyPerson";

@model({ dbOffset: "authenticated" })
export class Person extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  // prettier-ignore
  @property @min(1) @max(100) public age?: number;
  @property public gender?: "male" | "female" | "other";
  @property public scratchpad?: IDictionary;
  // prettier-ignore
  @property @pushKey public tags?: IDictionary<string>;

  // prettier-ignore
  @ownedBy(Person) @inverse("children") public motherId?: fk;
  // prettier-ignore
  @ownedBy(Person) @inverse("children") public fatherId?: fk;
  // prettier-ignore
  @hasMany(Person) public children?: IDictionary;

  @ownedBy(Company) public employerId?: fk;
}
