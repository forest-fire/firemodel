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
const expect = chai.expect;
require("reflect-metadata");
const person_1 = require("./testing/person");
const helpers = __importStar(require("./testing/helpers"));
const FireModel_1 = require("../src/FireModel");
helpers.setupEnv();
const db = new abstracted_admin_1.DB();
FireModel_1.FireModel.defaultDb = db;
describe("Tests using REAL db →", () => {
    it("List.since() works", async () => {
        try {
            await src_1.Record.add(person_1.Person, {
                name: "Carl Yazstrimski",
                age: 99
            });
            const timestamp = new Date().getTime();
            await helpers.wait(50);
            await src_1.Record.add(person_1.Person, {
                name: "Bob Geldof",
                age: 65
            });
            const since = src_1.List.since(person_1.Person, timestamp);
            // cleanup
            await db.remove("/authenticated");
        }
        catch (e) {
            throw e;
        }
    });
});
//# sourceMappingURL=real-db-spec.js.map