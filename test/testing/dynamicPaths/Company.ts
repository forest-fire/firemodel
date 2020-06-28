import { Model, fks, hasMany, mock, model, property } from "../../../src";

import DeepPerson from "./DeepPerson";

@model({ dbOffset: ":group/testing", localPostfix: "all" })
export default class Company extends Model {
  // prettier-ignore
  @property @mock("companyName") name: string;
  // prettier-ignore
  @property @mock("stateAbbr") state: string;
  // prettier-ignore
  @property @mock("sequence", "test", "test2") group: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "employer") employees: fks;
}
