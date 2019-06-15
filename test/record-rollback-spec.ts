// tslint:disable:no-implicit-dependencies
import { expect } from "chai";
import { DB } from "abstracted-client";
import { FireModel } from "../src/FireModel";

describe("Rolling back a record => ", () => {
  let db: DB;
  beforeEach(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("local Record value is reset to the rolled-back state when handling the error", async () => {
    //
  });

  it("dispatch() sends the original value on rollback", async () => {
    throw new Error("test not written");
  });
});
