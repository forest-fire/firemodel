import DeepPerson, { IDeepName } from "./testing/dynamicPaths/DeepPerson";

import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";
import { Record } from "../src";

describe("Record static utils", () => {
  it("Record.modelName() returns the name in PascalCase", () => {
    expect(Record.modelName(DeepPerson)).toBe("DeepPerson");
  });

  it("Record.compositeKey() with 1 path deep works when data is complete", async () => {
    const result = Record.compositeKey(DeepPerson, {
      id: "1234",
      group: "my-group",
    });

    expect(result).toBeInstanceOf(Object);
    expect(result.group).toBe("my-group");
  });

  it("Record.compositeKey() with 2 path deep works when data is complete", async () => {
    const result = Record.compositeKey(DeeperPerson, {
      id: "1234",
      group: "my-group",
      subGroup: "my-sub-group",
    });

    expect(result).toBeInstanceOf(Object);
    expect(result.id).toBe("1234");
    expect(result.group).toBe("my-group");
    expect(result.subGroup).toBe("my-sub-group");
  });

  it("Record.compositeKey() fails when not enough info", async () => {
    try {
      const result = Record.compositeKey(DeepPerson, {
        id: "1234",
      });
      throw new Error("should have thrown error due to lack of props");
    } catch (e) {
      expect(e.code).toBe("not-ready");
      expect(e.name).toBe("firemodel/not-ready");
      expect(e.message).toContain("group");
    }
  });

  it("Record.compositeKeyRef() 1 path deep works when data is complete", async () => {
    const result = Record.compositeKeyRef(DeepPerson, {
      id: "1234",
      group: "my-group",
    });

    expect(result).toBeString();
    expect(result).toBe("1234::group:my-group");
  });

  it("Record.compositeKeyRef() 2 path deep works when data is complete", async () => {
    const result = Record.compositeKeyRef(DeeperPerson, {
      id: "1234",
      group: "my-group",
      subGroup: "my-sub-group",
    });

    expect(result).toBeString();
    expect(result).toBe("1234::group:my-group::subGroup:my-sub-group");
  });
});
