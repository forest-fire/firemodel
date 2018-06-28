// tslint:disable:no-implicit-dependencies
import { Record, List } from "../src";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";
import * as helpers from "./testing/helpers";
import { FireModel } from "../src/FireModel";
helpers.setupEnv();
const db = new DB();
FireModel.defaultDb = db;

describe("Tests using REAL db →", () => {
  it.skip("List.since() works", async () => {
    try {
      await Record.add(Person, {
        name: "Carl Yazstrimski",
        age: 99
      });
      const timestamp = new Date().getTime();
      await helpers.wait(50);
      await Record.add(Person, {
        name: "Bob Geldof",
        age: 65
      });
      const since = List.since(Person, timestamp);

      // cleanup
      await db.remove("/authenticated");
    } catch (e) {
      throw e;
    }
  });
});
