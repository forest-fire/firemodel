import { Model, model, property } from "../../../src";

export interface IDeepName {
  first: string;
  middle?: string;
  last: string;
}

@model({ dbOffset: ":group/:subGroup/testing", localPostfix: "all" })
export class DeeperPerson extends Model {
  @property public name: IDeepName;
  @property public age: number;
  @property public group: string;
  @property public subGroup: string;
  @property public phoneNumber?: string;
}
