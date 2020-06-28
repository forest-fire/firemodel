import { Model, defaultValue, mock, model, property } from "../../../src";

@model()
export class Person extends Model {
  @property
  @mock(() => "work")
  @defaultValue("home")
  currentDeliveryAddress?: string;

  @property
  @mock(() => "home")
  @defaultValue("work")
  priorDeliveryAddress?: string;

  @property age: number;
}
