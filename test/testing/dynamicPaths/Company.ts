import { model, Model, property, hasMany, fks } from "../../../src";
import DeepPerson from "./DeepPerson";

@model({ dbOffset: ":group/testing", localPostfix: "all" })
export default class Company extends Model {
  @property name: string;
  @property state: string;
  @property group: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "employer") employees: fks;
}
