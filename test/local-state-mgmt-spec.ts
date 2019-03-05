// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
const expect = chai.expect;
import { IDictionary } from "common-types";
import { DB } from "abstracted-admin";
import { FireModel, Record } from "../src";
import { Concert } from "./testing/Concert";
import { Product } from "./testing/Product";

describe.only("Client state management", () => {
  let db: DB;
  before(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("Setting FireModel.localState overrides Record.localPath and List.localPath", async () => {
    FireModel.localState = {
      concert: {
        model: Concert,
        localPath: "/concert"
      },
      product: {
        model: Product,
        localPath: "/one/two/products/all"
      }
    };

    const concert = Record.create(Concert);
    expect(concert.localPath).to.equal("/concert");
    const product = Record.create(Product);
    expect(product.localPath).to.equal("/one/two/products/all");
  });
});
