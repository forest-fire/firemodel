import { model, Model, property, hasMany, length, ownedBy } from "../../src";
import { IDictionary, fk } from "common-types";
import { Person } from "./person";
import { mock } from "../../src/decorators/property";

@model({ dbOffset: "authenticated" })
export class Concert extends Model {
  // prettier-ignore
  @property public name: string;
  @property public employees?: number;
  @property public founded?: string;
  // prettier-ignore
  // @ownedBy(Person) public attendees: IDictionary<fk>;
}
