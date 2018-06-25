import { length, model, property, Model, hasMany } from "../../src";
import { mock } from "../../src/decorators/property";
import { FancyPerson } from "./FancyPerson";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  // prettier-ignore
  @property @length(20) @mock('company') public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
