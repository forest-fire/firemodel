import { model, property, Model, belongsTo, IFmHasOne } from "../../src";
import { Person } from "./Person";

@model({ dbOffset: "pay-offset", audit: true })
export class Pay extends Model {
  // prettier-ignore
  @belongsTo(() => Person) public employee?: IFmHasOne;
  @property public amount?: string;
}
