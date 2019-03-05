import { model, Model, property, hasMany } from "../../src";
import { IDictionary, fk } from "common-types";
import { Person } from "./Person";

@model({ dbOffset: "authenticated" })
export class Product extends Model {
  @property name: string;
  @property category: string;
  @property isInStock: boolean;
}
