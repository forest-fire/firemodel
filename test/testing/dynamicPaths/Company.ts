import { model, Model, property, hasMany, fks, mock } from "../../../src";
import DeepPerson from "./DeepPerson";

@model({ dbOffset: ":group/testing", localPostfix: "all" })
export default class Company extends Model {
  // prettier-ignore
  @property @mock("companyName") name: string;
  // prettier-ignore
  @property @mock("stateAbbr") state: string;
  @property group: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "employer") employees: fks;
}
