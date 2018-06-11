import {
  OldModel,
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

@model({ dbOffset: "authenticated" })
export class Person extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  @property public age?: number;
  @property public gender?: "male" | "female" | "other";
  @property public scratchpad?: IDictionary;
  // prettier-ignore
  @property @pushKey public tags?: IDictionary<string>;

  // prettier-ignore
  @ownedBy(Person) @inverse("children") public motherId?: fk;
  // prettier-ignore
  @ownedBy(Person) @inverse("children") public fatherId?: fk;
  @hasMany(Person) public children?: IDictionary;

  @ownedBy(Company) public employerId?: fk;
}
