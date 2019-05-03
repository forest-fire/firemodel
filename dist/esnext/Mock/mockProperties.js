import { Record } from "..";
import { getModelMeta } from "../ModelMeta";
import mockValue from "./mockValue";
/** adds mock values for all the properties on a given model */
export default function mockProperties(db, config = { relationshipBehavior: "ignore" }, exceptions) {
    return async (record) => {
        const meta = getModelMeta(record);
        const props = meta.properties;
        const recProps = {};
        // below is needed to import faker library
        props.map(prop => {
            const p = prop.property;
            recProps[p] = mockValue(db, prop);
        });
        const finalized = Object.assign({}, recProps, exceptions);
        // write to mock db and retain a reference to same model
        record = await Record.add(record.modelConstructor, finalized, {
            silent: true
        });
        return record;
    };
}
//# sourceMappingURL=mockProperties.js.map