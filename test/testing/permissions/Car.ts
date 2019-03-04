import { model, Model, property } from "../../../src";
import { mock } from "../../../src/decorators/constraints";

@model({ dbOffset: "no-write" })
export class Car extends Model {
  @property model: string;
  @property cost: number;
  @property description: string;
}
