import { Record, getModelMeta, mockValue, } from "@/private";
import { getMockHelper } from "firemock";
/** adds mock values for all the properties on a given model */
export function mockProperties(db, config = { relationshipBehavior: "ignore" }, exceptions) {
    return async (record) => {
        const meta = getModelMeta(record);
        const props = meta.properties;
        const recProps = {};
        // set properties on the record with mocks
        const mh = await getMockHelper(db);
        for (const prop of props) {
            const p = prop.property;
            recProps[p] = await mockValue(db, prop, mh);
        }
        // use mocked values but allow exceptions to override
        const finalized = { ...recProps, ...exceptions };
        // write to mock db and retain a reference to same model
        record = await Record.add(record.modelConstructor, finalized, {
            silent: true,
        });
        return record;
    };
}
//# sourceMappingURL=mockProperties.js.map