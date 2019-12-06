// tslint:disable:no-implicit-dependencies
import { DB } from "abstracted-admin";
import { expect } from "chai";
import { Record } from "../src";
import DeepPerson, { IDeepName } from "./testing/dynamicPaths/DeepPerson";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";

describe("Record static utils", () => {
  it("Record.modelName() returns the name in PascalCase", () => {
    expect(Record.modelName(DeepPerson)).to.equal("DeepPerson");
  });

  it("Record.compositeKey() with 1 path deep works when data is complete", async () => {
    const result = Record.compositeKey(DeepPerson, {
      id: "1234",
      group: "my-group"
    });

    expect(result).to.be.an("object");
    expect(result.group).to.equal("my-group");
  });

  it("Record.compositeKey() with 2 path deep works when data is complete", async () => {
    const result = Record.compositeKey(DeeperPerson, {
      id: "1234",
      group: "my-group",
      subGroup: "my-sub-group"
    });

    expect(result).to.be.an("object");
    expect(result.id).to.equal("1234");
    expect(result.group).to.equal("my-group");
    expect(result.subGroup).to.equal("my-sub-group");
  });

  it("Record.compositeKey() fails when not enough info", async () => {
    try {
      const result = Record.compositeKey(DeepPerson, {
        id: "1234"
      });
      throw new Error("should have thrown error due to lack of props");
    } catch (e) {
      expect(e.code).to.equal("not-ready");
      expect(e.name).to.equal("firemodel/not-ready");
      expect(e.message).to.include("group");
    }
  });

  it("Record.compositeKeyRef() 1 path deep works when data is complete", async () => {
    const result = Record.compositeKeyRef(DeepPerson, {
      id: "1234",
      group: "my-group"
    });

    expect(result).to.be.an("string");
    expect(result).to.equal("1234::group:my-group");
  });

  it("Record.compositeKeyRef() 2 path deep works when data is complete", async () => {
    const result = Record.compositeKeyRef(DeeperPerson, {
      id: "1234",
      group: "my-group",
      subGroup: "my-sub-group"
    });

    expect(result).to.be.an("string");
    expect(result).to.equal("1234::group:my-group::subGroup:my-sub-group");
  });
});
