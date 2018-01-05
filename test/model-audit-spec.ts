// tslint:disable:no-implicit-dependencies
import {
  Model,
  BaseSchema,
  Record,
  List,
  IAuditRecord,
  FirebaseCrudOperations
} from "../src/index";
import DB from "abstracted-admin";
import { SchemaCallback } from "firemock";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
import "reflect-metadata";
import { Klass, ContainedKlass, SubKlass } from "./testing/klass";
import { Person } from "./testing/person";
import { Company } from "./testing/company";
import { VerboseError } from "../src/VerboseError";
import { get as getStackFrame, parse as stackParse } from "stack-trace";

VerboseError.setStackParser((context: VerboseError) => stackParse(context));

describe("Model > Auditing: ", () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
  });

  it("Audit records stored when schema has them configured on", async () => {
    const CompanyModel = new Model<Company>(Company, db);
    const { key } = await CompanyModel.push({
      name: "Acme Corp",
      employees: 10
    });
    await CompanyModel.update(key, { founded: "1972" });
    await CompanyModel.remove(key, false, { reason: "testing" });
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
    const db = new DB({ mocking: true });
    const PersonModel = new Model<Person>(Person, db);
    const { key } = await PersonModel.push({ name: "Joe Jackson", age: 10 });
    await PersonModel.update(key, { age: 44 });
    await PersonModel.remove(key, false, { reason: "testing" });
    const auditTrail = await PersonModel.getAuditTrail();
    expect(auditTrail).to.be.an("array");
    expect(auditTrail.length).to.equal(0);
  });
});
