import { AuditLog, FireModel, List, Mock, Record } from "@/index";
import { IAbstractedDatabase, RealTimeAdmin } from "universal-fire";

import { Person } from "./testing/AuditedPerson";
import { wait } from "common-types";

describe("Auditing ->�", () => {
  let db: IAbstractedDatabase;

  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("Audit logs are written", async () => {
    await Mock(Person, db).generate(1);
    const now = new Date().getTime();
    const people = await List.all(Person);
    const firstPerson = await Record.get(Person, people.data[0].id);
    await Record.update(Person, firstPerson.id, { age: 11 });
    await firstPerson.update({ age: 22 });
    await firstPerson.update({ age: 33 });
    await firstPerson.remove();
    await wait(100); // TODO: this shouldn't be needed but it IS!
    const audit = (await List.all(AuditLog)).data;

    expect(audit).toHaveLength(5);
    const actions = audit.map((i) => i.action);

    expect(actions.includes("added")).toBe(true);
    expect(actions.includes("updated")).toBe(true);
    expect(actions.includes("removed")).toBe(true);
  });
});
