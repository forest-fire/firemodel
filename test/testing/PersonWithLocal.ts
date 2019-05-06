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
import { pushKey } from "../../src/decorators/constraints";
import { Concert } from "./Concert";
import { Pay } from "./Pay";

@model({ localModelName: "userProfile" })
export class PersonWithLocal extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  // prettier-ignore
  @property @min(1) @max(100) public age?: number;
  @property public gender?: "male" | "female" | "other";
  @property public scratchpad?: IDictionary;
  // prettier-ignore
  @property @pushKey public tags?: IDictionary<string>;
  // prettier-ignore
  @belongsTo(() => PersonWithLocal, "children") public mother?: fk;
  // prettier-ignore
  @belongsTo(() => PersonWithLocal, "children") public father?: fk;
  // prettier-ignore
  @hasMany(() => PersonWithLocal) public children?: fks;
  // prettier-ignore
  @belongsTo(() => Concert) public concerts?: fk;
  // prettier-ignore
  @belongsTo(() => Company) public company?: fk;
  // prettier-ignore
  @hasMany(() => Pay) public pays?: fks;
}
