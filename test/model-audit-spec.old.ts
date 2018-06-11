// tslint:disable:no-implicit-dependencies
import {
  OldModel,
  BaseSchema,
  Record,
  List,
  IAuditRecord,
  FirebaseCrudOperations
} from "../src/index";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/person";
import { Company } from "./testing/company";

describe("Model > Auditing: ", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
  });

  it("Audit records stored when schema has them configured on", async () => {
    const CompanyModel = new OldModel<Company>(Company, db);
    const { id } = await CompanyModel.push({
      name: "Acme Corp",
      employees: 10
    });

    await CompanyModel.update(id, { founded: "1972" });
    await CompanyModel.remove(id, false, { reason: "testing" });
    const auditTrail = await CompanyModel.getAuditTrail();
    expect(auditTrail).to.be.an("array");

    expect(auditTrail.length).to.equal(3);
    const pushed = auditTrail.filter(a => a.crud === "push").pop();
    expect(pushed.info).to.haveOwnProperty("properties");
    expect(pushed.info.properties).to.include("name");
    const removed = auditTrail.filter(a => a.crud === "remove").pop();
    expect(removed.info).to.haveOwnProperty("reason");
    expect(removed.info.reason).to.equal("testing");
    const updated = auditTrail.filter(a => a.crud === "update").pop();
    expect(updated.info).to.haveOwnProperty("updatedProperties");
    expect(updated.info.updatedProperties).to.include("founded");
  });

  it("Audit records NOT stored when schema has them configured off", async () => {
    const PersonModel = new OldModel<Person>(Person, db);
    const { id } = await PersonModel.push({ name: "Joe Jackson", age: 10 });
    await PersonModel.update(id, { age: 44 });
    await PersonModel.remove(id, false, { reason: "testing" });
    const auditTrail = await PersonModel.getAuditTrail();
    expect(auditTrail).to.be.an("array");
    expect(auditTrail.length).to.equal(0);
  });
});
