import { Model, mock, model, property } from "../src/private";

import { UserProfile } from "./UserProfile";

@model({ dbOffset: "move" })
export class Customer extends UserProfile {
  @property @mock(() => "home") currentDeliveryAddress?: string;
  @property @mock(() => "work") priorDeliveryAddress?: string;
}
