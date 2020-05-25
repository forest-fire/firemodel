"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProperties = void 0;
const private_1 = require("@/private");
const firemock_1 = require("firemock");
/** adds mock values for all the properties on a given model */
function mockProperties(db, config = { relationshipBehavior: "ignore" }, exceptions) {
    return async (record) => {
        const meta = private_1.getModelMeta(record);
        const props = meta.properties;
        const recProps = {};
        // set properties on the record with mocks
        const mh = await firemock_1.getMockHelper(db);
        for (const prop of props) {
            const p = prop.property;
            recProps[p] = await private_1.mockValue(db, prop, mh);
        }
        // use mocked values but allow exceptions to override
        const finalized = { ...recProps, ...exceptions };
        // write to mock db and retain a reference to same model
        record = await private_1.Record.add(record.modelConstructor, finalized, {
            silent: true,
        });
        return record;
    };
}
exports.mockProperties = mockProperties;
//# sourceMappingURL=mockProperties.js.map