import {
  Model,
  fk,
  hasOne,
  length,
  max,
  min,
  model,
  property,
} from "../../src/index";

import { Company } from "./Company";
import { IDictionary } from "common-types";

function bespokeMock(context: import("firemock").MockHelper) {
  return context.faker.name.firstName() + ", hello to you";
}

@model({ dbOffset: "authenticated", audit: true })
export class Person extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  // prettier-ignore
  @property @min(1) @max(100) public age?: number;
  @property public gender?: "male" | "female" | "other";
  @property public scratchpad?: IDictionary;
  @hasOne(() => Company) public company?: fk;
}
