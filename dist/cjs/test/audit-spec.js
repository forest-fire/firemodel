"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const src_1 = require("../src");
const abstracted_admin_1 = require("abstracted-admin");
const chai = __importStar(require("chai"));
const AuditedPerson_1 = require("./testing/AuditedPerson");
const Audit_1 = require("../src/Audit");
const FireModel_1 = require("../src/FireModel");
const common_types_1 = require("common-types");
const expect = chai.expect;
describe("Auditing ->�", () => {
    describe("Writing ->�", () => {
        let db;
        beforeEach(async () => {
            db = await abstracted_admin_1.DB.connect({ mocking: true });
            FireModel_1.FireModel.defaultDb = db;
        });
        it("writes to auditing table when adding a Record", async () => {
            const person = await src_1.Record.add(AuditedPerson_1.Person, {
                name: "Johhny Rocket",
                age: 20
            });
            const log = await db.getList("/auditing/people/all");
            expect(log).to.have.lengthOf(1);
            expect(log[0])
                .to.haveOwnProperty("action")
                .and.to.equal("added");
            const p2 = await src_1.Record.get(AuditedPerson_1.Person, log[0].recordId);
            expect(p2.data.name).to.equal("Johhny Rocket");
        });
        it("writes to auditing table when updating a record", async () => {
            await db.set("/authenticated/people/1234", {
                name: "Johhny Rocket",
                age: 20
            });
            const person = await src_1.Record.get(AuditedPerson_1.Person, "1234");
            await person.update({ age: 22 });
            const log = await db.getList("/auditing/people/all");
            expect(log).to.have.lengthOf(1);
            expect(log[0])
                .to.haveOwnProperty("action")
                .and.to.equal("updated");
            expect(log[0].changes).to.have.lengthOf(2);
            const changedProps = new Set(log[0].changes.map(i => i.property));
            expect(changedProps.has("lastUpdated")).to.equal(true);
            expect(changedProps.has("age")).to.equal(true);
            expect(changedProps.has("name")).to.equal(false);
            const p2 = await src_1.Record.get(AuditedPerson_1.Person, log[0].recordId);
            expect(p2.data.age).to.equal(22);
        });
    });
    describe("List →", () => {
        let db;
        beforeEach(async () => {
            db = await abstracted_admin_1.DB.connect({ mocking: true });
            FireModel_1.FireModel.defaultDb = db;
        });
        it("using Audit class, can get first and last 10 audit items", async () => {
            for (let i = 0; i < 10; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Johhny Rocket",
                    age: 20
                });
            }
            const people = await src_1.List.all(AuditedPerson_1.Person);
            const ids = people.map(i => i.id);
            for (let i = 0; i < 10; i++) {
                await src_1.Record.remove(AuditedPerson_1.Person, ids[i]);
            }
            const log = await db.getList("/auditing/people/all");
            expect(log).to.have.lengthOf(20);
            const alog = await Audit_1.Audit.list(AuditedPerson_1.Person).first(10);
            expect(alog).to.have.lengthOf(10);
            alog.map(i => {
                expect(i.action).to.equal("removed");
            });
            const blog = await Audit_1.Audit.list(AuditedPerson_1.Person).last(10);
            expect(blog).to.have.lengthOf(10);
            blog.map(i => {
                expect(i.action).to.equal("added");
            });
        });
        it("since() a given datetime", async () => {
            for (let i = 0; i < 5; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Johhny Rocket",
                    age: 20
                });
            }
            await common_types_1.wait(25);
            const now = new Date().getTime();
            await common_types_1.wait(25);
            for (let i = 0; i < 8; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Ronald McDonald",
                    age: 35
                });
            }
            const aLog = await Audit_1.Audit.list(AuditedPerson_1.Person).since(now);
            expect(aLog).to.have.lengthOf(8);
        });
        it("before() a given datetime ", async () => {
            for (let i = 0; i < 5; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Johhny Rocket",
                    age: 20
                });
            }
            await common_types_1.wait(25);
            const now = new Date().getTime();
            await common_types_1.wait(25);
            for (let i = 0; i < 8; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Ronald McDonald",
                    age: 35
                });
            }
            const aLog = await Audit_1.Audit.list(AuditedPerson_1.Person).before(now);
            expect(aLog).to.have.lengthOf(5);
        });
        it("between() a set of datetime stamps", async () => {
            for (let i = 0; i < 5; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Johhny Rocket",
                    age: 20
                });
            }
            await common_types_1.wait(25);
            const t1 = new Date().getTime();
            await common_types_1.wait(25);
            for (let i = 0; i < 8; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Ronald McDonald",
                    age: 35
                });
            }
            await common_types_1.wait(25);
            const t2 = new Date().getTime();
            await common_types_1.wait(25);
            for (let i = 0; i < 8; i++) {
                await src_1.Record.add(AuditedPerson_1.Person, {
                    name: "Ronald Reagan",
                    age: 68
                });
            }
            const aLog = await Audit_1.Audit.list(AuditedPerson_1.Person).between(t1, t2);
            expect(aLog).to.have.lengthOf(8);
        });
    });
    describe("Record →", () => {
        let db;
        beforeEach(async () => {
            db = await abstracted_admin_1.DB.connect({ mocking: true });
            FireModel_1.FireModel.defaultDb = db;
        });
        it("first() and last() works", async () => {
            await src_1.Mock(AuditedPerson_1.Person, db).generate(10);
            const people = await src_1.List.all(AuditedPerson_1.Person);
            const firstPerson = await src_1.Record.get(AuditedPerson_1.Person, people.data[0].id);
            await firstPerson.update({ age: 11 });
            await firstPerson.update({ age: 22 });
            await firstPerson.update({ age: 33 });
            await firstPerson.remove();
            // events: added, updated x 3, removed
            const auditFirst = await Audit_1.Audit.record(AuditedPerson_1.Person, firstPerson.id).first(1);
            const auditLast = await Audit_1.Audit.record(AuditedPerson_1.Person, firstPerson.id).last(1);
            expect(auditFirst).to.have.lengthOf(1);
            expect(auditFirst[0].action).to.equal("added");
            expect(auditLast[0].action).to.equal("removed");
        });
        it("since() works", async () => {
            await src_1.Mock(AuditedPerson_1.Person, db).generate(10);
            const people = await src_1.List.all(AuditedPerson_1.Person);
            const firstPerson = await src_1.Record.get(AuditedPerson_1.Person, people.data[0].id);
            await firstPerson.update({ age: 11 });
            await common_types_1.wait(25);
            const now = new Date().getTime();
            await common_types_1.wait(25);
            await firstPerson.update({ age: 22 });
            await firstPerson.update({ age: 33 });
            await firstPerson.remove();
            const since = await Audit_1.Audit.record(AuditedPerson_1.Person, firstPerson.id).since(now);
            expect(since).to.have.lengthOf(3);
            const actions = since.map(i => i.action);
            expect(actions.includes("updated")).to.equal(true);
            expect(actions.includes("removed")).to.equal(true);
            expect(actions.includes("added")).to.equal(false);
        });
        it("before() works", async () => {
            await src_1.Mock(AuditedPerson_1.Person, db).generate(10);
            const people = await src_1.List.all(AuditedPerson_1.Person);
            const firstPerson = await src_1.Record.get(AuditedPerson_1.Person, people.data[0].id);
            await firstPerson.update({ age: 11 });
            await common_types_1.wait(25);
            const now = new Date().getTime();
            await common_types_1.wait(25);
            await firstPerson.update({ age: 22 });
            await firstPerson.update({ age: 33 });
            await firstPerson.remove();
            const before = await Audit_1.Audit.record(AuditedPerson_1.Person, firstPerson.id).before(now);
            expect(before).to.have.lengthOf(2);
            const actions = before.map(i => i.action);
            expect(actions.includes("updated")).to.equal(true);
            expect(actions.includes("removed")).to.equal(false);
            expect(actions.includes("added")).to.equal(true);
        });
        it("between() works", async () => {
            await src_1.Mock(AuditedPerson_1.Person, db).generate(10);
            const people = await src_1.List.all(AuditedPerson_1.Person);
            const firstPerson = await src_1.Record.get(AuditedPerson_1.Person, people.data[0].id);
            await firstPerson.update({ age: 11 });
            await common_types_1.wait(25);
            const t1 = new Date().getTime();
            await common_types_1.wait(25);
            await firstPerson.update({ age: 22 });
            await common_types_1.wait(25);
            const t2 = new Date().getTime();
            await common_types_1.wait(25);
            await firstPerson.update({ age: 33 });
            await firstPerson.remove();
            const between = await Audit_1.Audit.record(AuditedPerson_1.Person, firstPerson.id).between(t1, t2);
            expect(between).to.have.lengthOf(1);
        });
    });
});
//# sourceMappingURL=audit-spec.js.map