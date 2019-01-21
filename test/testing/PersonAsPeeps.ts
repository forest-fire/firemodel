import {
  Model,
  property,
  min,
  max,
  length,
  model,
  fk,
  hasOne,
  hasMany
} from "../../src";
import { Company } from "./Company";
import { IDictionary } from "common-types";
import { pushKey } from "../../src/decorators/constraints";
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
  @hasOne(() => Person, "children") public mother?: fk;
  // prettier-ignore
  @hasOne(() => Person, "children") public father?: fk;
  // prettier-ignore
  @hasMany(() => Person) public children?: IDictionary;
  // prettier-ignore
  @hasOne(() => Concert) public concerts?: IDictionary;
  // prettier-ignore
  @hasOne(() => Company) public employerId?: fk;
}
