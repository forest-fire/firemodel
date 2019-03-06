// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
const expect = chai.expect;
import { IDictionary } from "common-types";
import { DB } from "abstracted-admin";
import { FireModel, Record } from "../src";
import { Concert } from "./testing/Concert";
import { Product } from "./testing/Product";

describe("Client state management", () => {
  let db: DB;
  before(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
  });
});
