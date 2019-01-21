import { length, model, property, Model, mock } from "../../src";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  // prettier-ignore
  @property @length(20) @mock('company') public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
