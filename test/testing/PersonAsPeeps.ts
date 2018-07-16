import {
  Model,
  property,
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
import { Concert } from "./Concert";

@model({ plural: "peeps" })
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
  @ownedBy(Person) @inverse("children") public mother?: fk;
  // prettier-ignore
  @ownedBy(Person) @inverse("children") public father?: fk;
  // prettier-ignore
  @hasMany(Person) public children?: IDictionary;
  // prettier-ignore
  // @ownedBy(Concert) public concerts?: IDictionary;
  @ownedBy(Company) public employerId?: fk;
}
