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
const abstracted_admin_1 = require("abstracted-admin");
const helpers_1 = require("./testing/helpers");
const chai = __importStar(require("chai"));
const expect = chai.expect;
helpers_1.setupEnv();
describe("Multi-path Set →", () => {
    it("duplicate paths throw error", async () => {
        const db = await abstracted_admin_1.DB.connect();
        const mps = db.multiPathSet("foo/bar");
        const data = [
            {
                path: "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ",
                value: 1530216926118
            },
            {
                path: "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/name/-LG71JibMhlEQ4V_MMfQ",
                value: 1530216926118
            },
            {
                path: "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/age/-LG71JibMhlEQ4V_MMfQ",
                value: 1530216926118
            }
        ];
        data.map(item => {
            mps.add(item);
        });
        try {
            mps.add({
                path: "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ",
                value: 1530216926119
            });
        }
        catch (e) {
            expect(e.name).to.equal("DuplicatePath");
        }
    });
    it("fullpaths is what it should be", async () => {
        const db = await abstracted_admin_1.DB.connect();
        const mps = db.multiPathSet("foo/bar");
        const data = [
            {
                path: "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/all/-LG71JibMhlEQ4V_MMfQ",
                value: 1530216926118
            },
            {
                path: "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/name/-LG71JibMhlEQ4V_MMfQ",
                value: 1530216926118
            },
            {
                path: "/auditing/people/byId/-LG71JiaTVG5qMobx5vh/props/age/-LG71JibMhlEQ4V_MMfQ",
                value: 1530216926118
            }
        ];
        data.map(item => {
            mps.add(item);
        });
        expect(mps.fullPaths).to.be.an("array");
        expect(mps.fullPaths[0]).to.be.a("string");
        expect(mps.fullPaths[0]).to.equal("foo/bar" + data[0].path);
    });
});
//# sourceMappingURL=mps-spec.js.map