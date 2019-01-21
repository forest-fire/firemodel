import {
  Model,
  property,
  min,
  max,
  length,
  model,
  fk,
  hasMany,
  belongsTo
} from "../../src";
import { Company } from "./Company";
import { IDictionary } from "common-types";
import { pushKey } from "../../src/decorators/constraints";
import { Concert } from "./Concert";

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
  @belongsTo(() => Person, "children") public mother?: fk;
  // prettier-ignore
  @belongsTo(() => Person, "children") public father?: fk;
  // prettier-ignore
  @hasMany(() => Person) public children?: IDictionary;
  // prettier-ignore
  @belongsTo(() => Concert) public concerts?: IDictionary;
  // prettier-ignore
  @belongsTo(() => Company) public employerId?: fk;
}
