// tslint:disable:no-implicit-dependencies

import { FireModel, Record } from "../src";

import { Car } from "./testing/permissions/Car";
import { IDictionary } from "common-types";
// import { DB, SDK, IAbstractedDatabase } from "universal-fire";
import { RealTimeClient } from "@forest-fire/real-time-client";
import { expect } from "chai";

const clientConfig = {
  apiKey: "AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM",
  authDomain: "abstracted-admin.firebaseapp.com",
  databaseURL: "https://abstracted-admin.firebaseio.com",
  projectId: "abstracted-admin",
  storageBucket: "abstracted-admin.appspot.com",
  messagingSenderId: "547394508788",
};

describe("Validating client permissions with an anonymous user", () => {
  let db: RealTimeClient;

  before(async () => {
    db = await RealTimeClient.connect(clientConfig);
    FireModel.defaultDb = db;
  });

  it("Writing to an area without permissions fails and rolls local changes back", async () => {
    const events: IDictionary = [];
    const dispatch = async (payload: IDictionary) => {
      events.push(payload);
    };
    FireModel.dispatch = dispatch;

    try {
      await Record.add(Car, {
        id: "1234",
        description: "one great car",
        model: "Chevy",
        cost: 10000,
      });
    } catch (e) {
      console.log(e);

      expect(e.code).to.equal("permission-denied");
    }

    expect(
      events.filter((i: any) => i.type === "@firemodel/RECORD_ADDED_ROLLBACK")
    ).to.have.lengthOf(1);
  });
});
