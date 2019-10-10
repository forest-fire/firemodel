"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const ModelMeta_1 = require("../ModelMeta");
const mockValue_1 = __importDefault(require("./mockValue"));
/** adds mock values for all the properties on a given model */
function mockProperties(db, config = { relationshipBehavior: "ignore" }, exceptions) {
    return async (record) => {
        const meta = ModelMeta_1.getModelMeta(record);
        const props = meta.properties;
        const recProps = {};
        // set properties on the record with mocks
        const mh = await (await Promise.resolve().then(() => __importStar(require("firemock")))).getMockHelper(db);
        for (const prop of props) {
            const p = prop.property;
            recProps[p] = await mockValue_1.default(db, prop, mh);
        }
        // use mocked values but allow exceptions to override
        const finalized = Object.assign(Object.assign({}, recProps), exceptions);
        // write to mock db and retain a reference to same model
        record = await __1.Record.add(record.modelConstructor, finalized, {
            silent: true
        });
        return record;
    };
}
exports.default = mockProperties;
//# sourceMappingURL=mockProperties.js.map