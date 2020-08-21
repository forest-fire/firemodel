import {
  Model,
  fk,
  hasOne,
  index,
  model,
  property,
  mock,
} from "../../src/index";

import { FancyPerson } from "./FancyPerson";

function modelYear() {
  return 2018 - Math.floor(Math.random() * 10);
}

@model({ dbOffset: "car-offset" })
export class Car extends Model {
  @property @mock("random", "Impala", "Nova", "Galaxy") public model: string;
  @property @mock("number", { min: 1000, max: 20000 }) public cost: number;
  @property @mock(modelYear) @index public modelYear: number;
  @hasOne(() => FancyPerson) public owner?: fk;
}
