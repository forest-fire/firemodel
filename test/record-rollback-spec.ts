import { IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { FireModel } from "../src/private";

describe("Rolling back a record => ", () => {
  let db: IRealTimeAdmin;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
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
