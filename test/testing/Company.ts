import { fk, length, model, property, Model, mock, IFmHasMany, hasMany } from "../../src";
import { Person } from "./AuditedPerson";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  // prettier-ignore
  @property @length(20) @mock('company') public name: string;
  // prettier-ignore
  @hasMany(() => Person) public employees?: fk[];
  @property public founded?: string;
}
