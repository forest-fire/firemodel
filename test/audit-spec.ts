// tslint:disable:no-implicit-dependencies
import { Record, List } from "../src";
import { DB, RealTimeDB } from "abstracted-admin";
import * as chai from "chai";
import { Person } from "./testing/AuditedPerson";
import { Audit, IAuditLogItem } from "../src/Audit";
import { FireModel } from "../src/FireModel";
const expect = chai.expect;

describe("Auditing →", () => {
  let db: RealTimeDB;
  beforeEach(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
  });
  it("When auditing is on, writes to auditing table take place Record.add", async () => {
    const person = Record.add(Person, {
      name: "Johhny Rocket",
      age: 20
    });
    const log = await db.getList<IAuditLogItem>("/auditing/people");
    expect(log).to.have.lengthOf(1);
    expect(log[0])
      .to.haveOwnProperty("action")
      .and.to.equal("added");
    const p2 = await Record.get(Person, log[0].recordId);
    expect(p2.data.name).to.equal("Johhny Rocket");
  });
  it("When auditing is on, writes to auditing table take place Record.add", async () => {
    await db.set("/authenticated/people/1234", {
      name: "Johhny Rocket",
      age: 20
    });
    const person = await Record.get(Person, "1234");
    await person.update({ age: 22 });

    const log = await db.getList<IAuditLogItem>("/auditing/people");
    expect(log).to.have.lengthOf(1);
    expect(log[0])
      .to.haveOwnProperty("action")
      .and.to.equal("updated");
    expect(log[0].changes).to.have.lengthOf(2);
    const changedProps = new Set(log[0].changes.map(i => i.property));
    expect(changedProps.has("lastUpdated")).to.equal(true);
    expect(changedProps.has("age")).to.equal(true);
    expect(changedProps.has("name")).to.equal(false);
    const p2 = await Record.get(Person, log[0].recordId);
    expect(p2.data.age).to.equal(22);
  });
});
