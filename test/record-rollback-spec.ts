import { IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { FireModel } from "@/index";

describe("Rolling back a record => ", () => {
  beforeEach(async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({ mocking: true });;
  });

  // TODO: write test
  it.skip("local Record value is reset to the rolled-back state when handling the error", async () => {
    throw new Error("test not written");
  });

  // TODO: write test
  it.skip("dispatch() sends the original value on rollback", async () => {
    throw new Error("test not written");
  });
});
