import {
  Model,
  property,
  min,
  max,
  length,
  model,
  fk,
  hasMany,
  belongsTo,
  IFmHasMany,
  fks
} from "../../src";
import { Company } from "./Company";
import { IDictionary } from "common-types";
import { pushKey, mock } from "../../src/decorators";
import { Concert } from "./Concert";
import { Pay } from "./Pay";

@model({ localModelName: "userProfile", localPrefix: "peeps" })
export class PersonWithLocalAndPrefix extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  // prettier-ignore
  @property @min(1) @max(100) public age?: number;
  @property @mock("random", "male", "female") public gender?:
    | "male"
    | "female"
    | "other";
  @property public scratchpad?: IDictionary;
  // prettier-ignore
  @property @pushKey public tags?: IDictionary<string>;
  // prettier-ignore
  @belongsTo(() => PersonWithLocalAndPrefix, "children") public mother?: fk;
  // prettier-ignore
  @belongsTo(() => PersonWithLocalAndPrefix, "children") public father?: fk;
  // prettier-ignore
  @hasMany(() => PersonWithLocalAndPrefix) public children?: fks;
  // prettier-ignore
  @belongsTo(() => Concert) public concerts?: fk;
  // prettier-ignore
  @belongsTo(() => Company) public company?: fk;
  // prettier-ignore
  @hasMany(() => Pay) public pays?: fks;
}
