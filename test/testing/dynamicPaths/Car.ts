import { model, Model, property, hasMany, fks, mock } from "../../../src";
import DeepPerson from "./DeepPerson";

@model({ dbOffset: "geo/:vendor" })
export default class Location extends Model {
  // prettier-ignore
  @property @mock("companyName") name: string;
  // prettier-ignore
  @property @mock("sequence", "Chevy", "Ford") vendor: string;
  // prettier-ignore
  @property @mock("word") model: string;
  // prettier-ignore
  @property @mock("number", 1970, 2018) year: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "cars") owners: fks;
}
