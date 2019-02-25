"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelMeta_1 = require("../ModelMeta");
const mockValue_1 = require("./mockValue");
/** adds mock values for all the properties on a given model */
function mockProperties(db, config = { relationshipBehavior: "ignore" }, exceptions) {
    return async (record) => {
        const meta = ModelMeta_1.getModelMeta(record);
        const props = meta.properties;
        const recProps = {};
        props.map(prop => {
            const p = prop.property;
            recProps[p] = mockValue_1.default(db, prop);
        });
        const finalized = Object.assign({}, recProps, exceptions);
        // write to mock db and retain a reference to same model
        record = await record.addAnother(finalized);
        return record;
    };
}
exports.default = mockProperties;
//# sourceMappingURL=mockProperties.js.map