import { Model, fks, hasMany, mock, model, property } from "../../../src";

import DeepPerson from "./DeepPerson";

@model({ dbOffset: "vendor/:vendor" })
export default class Car extends Model {
  // prettier-ignore
  @property @mock("companyName") name: string;
  // prettier-ignore
  @property @mock("sequence", "Chevy", "Ford") vendor: string;
  // prettier-ignore
  @property @mock("word") model: string;
  // prettier-ignore
  @property @mock("number", {min: 1970, max: 2018}) year: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "cars") owners?: fks;
}
