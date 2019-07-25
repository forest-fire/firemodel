"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstracted_client_1 = require("abstracted-client");
const FireModel_1 = require("../src/FireModel");
describe("Rolling back a record => ", () => {
    let db;
    beforeEach(async () => {
        db = await abstracted_client_1.DB.connect({ mocking: true });
        FireModel_1.FireModel.defaultDb = db;
    });
    // TODO: write test
    it.skip("local Record value is reset to the rolled-back state when handling the error", async () => {
        throw new Error("test not written");
    });
    // TODO: write test
    it.skip("dispatch() sends the original value on rollback", async () => {
        throw new Error("test not written");
    });
});
//# sourceMappingURL=record-rollback-spec.js.map