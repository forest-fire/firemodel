import { Model, fk, hasOne, mock, model, property } from "../../../src";

@model({ dbOffset: "up" })
export class UserProfile extends Model {
  /** the user's name */
  @property @mock("name") name: string;
  @property @mock("uuid") uid: string;
  @property @mock("firstName") nickname?: string;
}
