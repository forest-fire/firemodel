import { model, Model, property, hasMany, mock } from "../../src";

@model({ dbOffset: "authenticated" })
export class Product extends Model {
  @property @mock("name") name: string;
  @property category: string;
  @property @mock("number", { min: 10, max: 100 }) minCost?: number;
  @property isInStock: boolean;
}
