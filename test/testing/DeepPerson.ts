import { model, Model, property } from "../../src";

export interface IDeepName {
  first: string;
  middle?: string;
  last: string;
}

@model({ dbOffset: ":group/testing", localPostfix: "all" })
export class DeepPerson extends Model {
  @property public name: IDeepName;
  @property public age: number;
  @property public group: string;
  @property public phoneNumber: string;
}
