import { model, property, Model, belongsTo, IFmHasOne } from "../../../src";
import { Person } from "../Person";

@model({ dbOffset: ":person", audit: true })
export class PersonPay extends Model {
  // prettier-ignore
  @belongsTo(() => Person) public person: IFmHasOne;
  @property public amount?: string;
}
