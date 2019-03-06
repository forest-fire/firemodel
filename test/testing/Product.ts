import { model, Model, property, hasMany } from "../../src";

@model({ dbOffset: "authenticated" })
export class Product extends Model {
  @property name: string;
  @property category: string;
  @property isInStock: boolean;
}
