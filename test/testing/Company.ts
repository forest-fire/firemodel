import {
  Model,
  fks,
  hasMany,
  length,
  mock,
  model,
  property,
} from "../../src/index";

import { Person } from "./AuditedPerson";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  // prettier-ignore
  @property @length(20) @mock('companyName') name: string;
  @property founded?: string;
  // prettier-ignore
  @hasMany(() => Person, "company") employees?: fks;
}
