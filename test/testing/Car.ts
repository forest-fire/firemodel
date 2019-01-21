import { model, Model, property, ownedBy, fk, hasMany, index } from "../../src";
import { mock } from "../../src/decorators/constraints";
import { Company } from "./Company";
import { Person } from "./person";

function modelYear() {
  return 2018 - Math.floor(Math.random() * 10);
}

@model({ dbOffset: "car-offset" })
export class Car extends Model {
  @property public model: string;
  @property public cost: number;
  // prettier-ignore
  @property @mock(modelYear) @index public modelYear: number;
  // prettier-ignore
  @ownedBy(() => Person) public owner?: fk;
}
