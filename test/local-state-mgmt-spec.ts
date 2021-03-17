import { FireModel, List, Record } from "@/index";
import { IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { DynamicPerson } from "./testing/localStateMgmt/DynamicPerson";
import { Person } from "./testing/localStateMgmt/Person";
import { PostfixPerson } from "./testing/localStateMgmt/PostfixPerson";
import { pathJoin } from "@/util";

describe("Client state management", () => {
  beforeAll(async () => {
    FireModel.defaultDb =  await RealTimeAdmin.connect({ mocking: true });
  });

  it("when using a RECORD, the localPath is equal to the prefix plus 'localModelName' if there are no dynamic components", async () => {
    const person = await Record.create(Person);
    expect(person.localPath).toBe(
      person.localPrefix + "/" + person.META.localModelName
    );
    expect(person.localDynamicComponents).toBeArray();
    expect(person.localDynamicComponents).toHaveLength(0);
  });
  it("when using a RECORD, dynamic components from localPrefix are expanded in localPath", async () => {
    const person = await Record.create(DynamicPerson);
    person.id = "1234";
    expect(person.localDynamicComponents).toEqual(
      expect.arrayContaining(["id"])
    );
    expect(person.localPrefix).toBe("/foo/bar/:id");
    expect(person.localPath).toBe("/foo/bar/1234/dynamicPerson");
  });

  it("when using a LIST, the localPath is the prefix, pluralName (assuming no dynamic components)", async () => {
    const people = await List.all(Person);
    // localPath should combine prefix [ ${people.META.localPrefix} ] and pluralName [ ${people.pluralName} ]
    expect(people.localPath).toBe(
      pathJoin(people.META.localPrefix, people.pluralName)
    );
    expect(people.localPostfix).toBe("all");
  });

  it("when using a LIST, the localPath is the prefix, pluralName, and then the postFix if it is set", async () => {
    const people = await List.all(PostfixPerson);
    expect(people.META.localPostfix).toBe("since");
    expect(people.localPath).toBe(
      pathJoin(people.META.localPrefix, people.pluralName)
    );
    expect(people.localPostfix).toBe("since");
  });
});
