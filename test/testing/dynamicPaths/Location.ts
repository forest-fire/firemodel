import { Model, fks, hasMany, mock, model, property } from "../../../src";

import DeepPerson from "./DeepPerson";

@model({ dbOffset: "geo/:state" })
export default class Location extends Model {
  // prettier-ignore
  @property @mock("companyName") name: string;
  // prettier-ignore
  @property @mock("sequence", "MA", "CT") state: string;
  // prettier-ignore
  @property @mock("longitude") longitude: number;
  // prettier-ignore
  @property @mock("latitude") latitude: number;
  // prettier-ignore
  @hasMany(() => DeepPerson, "home") residents: fks;
}
