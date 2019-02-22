import { model, Model, property } from "../../../src";

@model({})
export class HumanAttribute extends Model {
  @property public attribute: string;
}
