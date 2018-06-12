import { length, model, property, Model } from "../../src";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  @property
  @length(20)
  public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
