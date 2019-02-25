import { model, Model, property, hasMany, fks, mock } from "../../../src";
import DeepPerson from "./DeepPerson";

@model({})
export default class Hobby extends Model {
  // prettier-ignore
  @property @mock("word") name: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "hobbies") practitioners: fks;
}
