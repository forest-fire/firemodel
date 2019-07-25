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
const chai = __importStar(require("chai"));
const expect = chai.expect;
const abstracted_client_1 = require("abstracted-client");
const src_1 = require("../src");
const Car_1 = require("./testing/permissions/Car");
const clientConfig = {
    apiKey: "AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM",
    authDomain: "abstracted-admin.firebaseapp.com",
    databaseURL: "https://abstracted-admin.firebaseio.com",
    projectId: "abstracted-admin",
    storageBucket: "abstracted-admin.appspot.com",
    messagingSenderId: "547394508788"
};
describe("Validating client permissions with an anonymous user", () => {
    let db;
    before(async () => {
        db = await abstracted_client_1.DB.connect(clientConfig);
        src_1.FireModel.defaultDb = db;
    });
    it("Writing to an area without permissions fails and rolls local changes back", async () => {
        const events = [];
        const dispatch = (payload) => {
            events.push(payload);
        };
        src_1.FireModel.dispatch = dispatch;
        try {
            await src_1.Record.add(Car_1.Car, {
                id: "1234",
                description: "one great car",
                model: "Chevy",
                cost: 10000
            });
        }
        catch (e) {
            expect(e.code).to.equal("permission-denied");
        }
        expect(events.filter((i) => i.type === "@firemodel/RECORD_ADDED_ROLLBACK")).to.have.lengthOf(1);
    });
});
//# sourceMappingURL=client-permissions-spec.js.map