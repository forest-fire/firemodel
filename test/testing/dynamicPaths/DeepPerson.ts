import {
  model,
  Model,
  property,
  hasMany,
  fks,
  hasOne,
  fk,
  mock
} from "../../../src";
import Hobby from "./Hobby";
import Company from "./Company";
import Location from "./Location";
import { HumanAttribute } from "./HumanAttribute";
import School from "./School";
import Car from "./Car";

export interface IDeepName {
  first: string;
  middle?: string;
  last: string;
}

@model({ dbOffset: "/group/:group/testing" })
export default class DeepPerson extends Model {
  @property name: IDeepName;
  @property age: number;
  // prettier-ignore
  @property @mock("random", "The Dude", "Jackass", "Boomer", "Buster") nickname?: string;
  // prettier-ignore
  @property @mock("random", "CT","MA","CA") group: string;
  // prettier-ignore
  @property @mock("placeImage", 640, 480) photo?: string;
  // prettier-ignore
  @property @mock("phoneNumber") phoneNumber: string;
  // prettier-ignore
  @hasOne(() => School, "students") school?: fk;
  // prettier-ignore
  @hasOne(() => Location, "residents") home?: fk;
  // prettier-ignore
  @hasOne(() => Company, "employees") employer?: fk;
  // prettier-ignore
  @hasMany(() => Hobby, "practitioners") hobbies?: fks;
  // prettier-ignore
  @hasMany(() => Car, "owners") cars?: fks;
  // prettier-ignore
  @hasMany(() => DeepPerson, "children") parents?: fks;
  // prettier-ignore
  @hasMany(() => DeepPerson, "parents") children?: fks;
  // prettier-ignore
  @hasMany(() => HumanAttribute) attributes?: fks;
}
