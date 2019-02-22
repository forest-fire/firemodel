import { model, Model, property, hasMany, fks } from "../../../src";
import DeepPerson from "./DeepPerson";

@model({})
export default class Hobby extends Model {
  @property name: string;
  // prettier-ignore
  @hasMany(() => DeepPerson, "hobbies") practitioners: fks;
}
