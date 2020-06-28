import { Model, model, property } from "../../../src";

@model({ dbOffset: "no-write" })
export class Car extends Model {
  @property model: string;
  @property cost: number;
  @property description: string;
}
