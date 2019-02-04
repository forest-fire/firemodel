import { model, Model, property, hasMany } from "../../src";
import { IDictionary, fk } from "common-types";
import { Person } from "./Person";

@model({ dbOffset: "authenticated" })
export class Concert extends Model {
  // prettier-ignore
  @property public name: string;
  @property public employees?: number;
  @property public founded?: string;
  // prettier-ignore
  // @hasMany(() => Person) public attendees: IDictionary<fk>;
}
