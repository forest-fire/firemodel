import {
  OldOldModel,
  Model,
  property,
  constrainedProperty,
  constrain,
  desc,
  min,
  max,
  length,
  schema
} from "../../src/index";

@schema({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  @property
  @length(20)
  public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
