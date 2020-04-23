// tslint:disable:no-implicit-dependencies
import { DB as Admin } from "abstracted-admin";
import { setupEnv } from "./testing/helpers";
import * as chai from "chai";
const expect = chai.expect;

setupEnv();

describe("Wrapping abstracted-xxx's Multi-path Set →", () => {
  it("basic multipath set, sets at given paths", async () => {
    const db = await Admin.connect();
    await db.multiPathSet({
      "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ": 1530216926118,
      "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/name/-LG71JibMhlEQ4V_MMfQ": 1530216926118,
      "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/age/-LG71JibMhlEQ4V_MMfQ": 1530216926118,
    });
    const data = await db.getRecord(
      "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/"
    );

    expect(data).to.haveOwnProperty("all");
    expect(data).to.haveOwnProperty("props");
    expect(data.all["-LG71JibMhlEQ4V_MMfQ"]).to.equal(1530216926118);
  });
});
