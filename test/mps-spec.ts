// tslint:disable:no-implicit-dependencies
import { DB as Admin } from "abstracted-admin";
import { setupEnv } from "./testing/helpers";
import * as chai from "chai";
const expect = chai.expect;

setupEnv();

describe.only("Multi-path Set →", () => {
  it("duplicate paths throw error", async () => {
    const db = await Admin.connect();
    const mps = db.multiPathSet("foo/bar");
    const data = [
      {
        path:
          "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ",
        value: 1530216926118
      },
      {
        path:
          "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/name/-LG71JibMhlEQ4V_MMfQ",
        value: 1530216926118
      },
      {
        path:
          "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/age/-LG71JibMhlEQ4V_MMfQ",
        value: 1530216926118
      }
    ];
    data.map(item => {
      mps.add(item);
    });

    try {
      mps.add({
        path:
          "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ",
        value: 1530216926119
      });
    } catch (e) {
      expect(e.name).to.equal("DuplicatePath");
    }
  });

  it("fullpaths is what it should be", async () => {
    const db = await Admin.connect();
    const mps = db.multiPathSet("foo/bar");
    const data = [
      {
        path:
          "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ",
        value: 1530216926118
      },
      {
        path:
          "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/name/-LG71JibMhlEQ4V_MMfQ",
        value: 1530216926118
      },
      {
        path:
          "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/age/-LG71JibMhlEQ4V_MMfQ",
        value: 1530216926118
      }
    ];
    data.map(item => {
      mps.add(item);
    });

    expect(mps.fullPaths).to.be.an("array");
    expect(mps.fullPaths[0]).to.be.a("string");
    expect(mps.fullPaths[0]).to.equal("foo/bar" + data[0].path);
  });
});
