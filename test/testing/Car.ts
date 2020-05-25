import { Model, fk, hasOne, index, model, property } from "../../src/private";

import { FancyPerson } from "./FancyPerson";
import { mock } from "../../src/decorators";

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
  @hasOne(() => FancyPerson) public owner?: fk;
}
