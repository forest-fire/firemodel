import { Model, mock, model, property } from "../../../src";

export interface IDeepName {
  first: string;
  middle?: string;
  last: string;
}

@model({ dbOffset: ":group/:subGroup/testing", localPostfix: "all" })
export class MockedPerson2 extends Model {
  @property name: IDeepName;
  @property age: number;
  @property phoneNumber: string;
  // prettier-ignore
  @property @mock("random", "fi", "fo", "fum") group: string;
  // prettier-ignore
  @property @mock("word") subGroup: string;
}
