import { length, model, property, Model } from "../../src";
import { mock } from "../../src/decorators/property";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  // prettier-ignore
  @property @length(20) @mock('company') public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
