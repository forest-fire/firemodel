import {
  fk,
  length,
  model,
  property,
  Model,
  mock,
  hasMany,
  fks
} from "../../src";
import { Person } from "./AuditedPerson";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  // prettier-ignore
  @property @length(20) @mock('companyName') name: string;
  @property founded?: string;
  // prettier-ignore
  @hasMany(() => Person, "company") employees?: fks;
}
