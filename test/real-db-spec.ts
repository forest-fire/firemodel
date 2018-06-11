// tslint:disable:no-implicit-dependencies
import { Record, List } from "../src/index";
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
  it("List.since() works", async () => {
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
      // const age = List.where(Person, "age", [">", 70]);
      // console.log(age);

      // const since = await db
      //   .ref("/authenticated/people")
      //   .startAt(timestamp)
      //   .once("value");
      // console.log(`timestamp ${timestamp}: `, since.val());

      // cleanup
      await db.remove("/authenticated");
    } catch (e) {
      throw e;
    }
  });
});
