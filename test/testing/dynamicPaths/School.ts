import { Model, fks, hasMany, mock, model, property } from "../../../src";

import DeepPerson from "./DeepPerson";

@model()
export default class School extends Model {
  // prettier-ignore
  @property @mock("companyName") name: string;
  // prettier-ignore
  @property @mock("stateAbbr") state: string;
  @property group: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "school") students: fks;
}
