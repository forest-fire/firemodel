// tslint:disable:no-implicit-dependencies
import { expect } from "chai";
import { FireModel } from "../src/FireModel";
import { DB, SDK } from "universal-fire";

describe("Rolling back a record => ", () => {
  let db: ISdkClient;
  beforeEach(async () => {
    db = await DB.connect(SDK.RealTimeClient, { mocking: true });
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
