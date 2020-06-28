import {
  Model,
  fk,
  fks,
  hasMany,
  hasOne,
  index,
  mock,
  model,
  property,
} from "../../../src";

import Car from "./Car";
import Company from "./Company";
import Hobby from "./Hobby";
import { HumanAttribute } from "./HumanAttribute";
import Location from "./Location";
import School from "./School";

export interface IDeepName {
  first: string;
  middle?: string;
  last: string;
}

@model({ dbOffset: "/group/:group/testing" })
export default class DeepPerson extends Model {
  @property name: IDeepName;
  @property @mock("number", { min: 18, max: 75 }) @index age: number;
  // prettier-ignore
  @property @mock("random", "The Dude", "Jackass", "Boomer", "Buster") nickname?: string;
  // prettier-ignore
  @property @mock("random", "CT","MA","CA") group: string;
  // prettier-ignore
  @property @mock("placeImage", 640, 480) photo?: string;
  // prettier-ignore
  @property @mock("phoneNumber") phoneNumber?: string;
  // prettier-ignore
  @hasOne(() => School, "students") school?: fk;
  // prettier-ignore
  @hasOne(() => Location, "residents") home?: fk;
  // prettier-ignore
  @hasOne(() => Company, "employees") employer?: fk;
  // prettier-ignore
  @hasMany(() => Hobby, "practitioners") hobbies?: fks;
  // prettier-ignore
  @hasMany(Car, "owners") cars?: fks;
  // prettier-ignore
  @hasMany('DeepPerson', "children") parents?: fks;
  // prettier-ignore
  @hasMany('DeepPerson', "parents") children?: fks;
  // prettier-ignore
  @hasMany(HumanAttribute) attributes?: fks;
}
