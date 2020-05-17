// tslint:disable:no-implicit-dependencies
import { expect } from "chai";
import { Record, List, Mock } from "../src";
import { AuditLog } from "../src/models/index";
import { DB, RealTimeAdmin } from "universal-fire";
import { Person } from "./testing/AuditedPerson";
import { FireModel } from "../src/FireModel";
import { wait } from "common-types";

describe("Auditing ->�", () => {
  let db: RealTimeAdmin;

  beforeEach(async () => {
    db = await DB.connect(RealTimeAdmin, { mocking: true });
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
    // console.log(JSON.stringify(audit, null, 2));

    expect(audit).to.have.lengthOf(5);
    const actions = audit.map((i) => i.action);

    expect(actions.includes("added")).to.equal(true);
    expect(actions.includes("updated")).to.equal(true);
    expect(actions.includes("removed")).to.equal(
      true,
      "removed audit should have been included"
    );
  });
});
