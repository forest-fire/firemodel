import { model, Model, property, hasMany, fks, hasOne, fk } from "../../../src";
import Hobby from "./Hobby";
import Company from "./Company";
import { HumanAttribute } from "./HumanAttribute";

export interface IDeepName {
  first: string;
  middle?: string;
  last: string;
}

@model({ dbOffset: ":group/testing" })
export default class DeepPerson extends Model {
  @property public name: IDeepName;
  @property public age: number;
  @property public group: string;
  @property public phoneNumber: string;
  // prettier-ignore
  @hasOne(() => Company, "employees") public employer?: fk;
  // prettier-ignore
  @hasMany(() => Hobby, "practitioners") public hobbies?: fks;
  // prettier-ignore
  @hasMany(() => DeepPerson, "children") public parents?: fks;
  // prettier-ignore
  @hasMany(() => DeepPerson, "parents") public children?: fks;
  // prettier-ignore
  @hasMany(() => HumanAttribute) public attributes?: fks;
}
