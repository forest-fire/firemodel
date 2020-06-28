import { Model, mock, model, property } from "@/index";

@model({ dbOffset: "attributes/:category" })
export class HumanAttribute extends Model {
  @property public attribute: string;
  @property @mock("sequence", "positive", "negative") category: string;
}
