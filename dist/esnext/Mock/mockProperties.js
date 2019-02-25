import { getModelMeta } from "../ModelMeta";
import mockValue from "./mockValue";
/** adds mock values for all the properties on a given model */
export default function mockProperties(db, config, exceptions) {
    return async (instance) => {
        const meta = getModelMeta(instance);
        const props = meta.properties;
        const recProps = {};
        props.map(prop => {
            const p = prop.property;
            recProps[p] = mockValue(db, prop);
        });
        const finalized = Object.assign({}, recProps, exceptions);
        // write to mock db and retain a reference to same model
        instance = await instance.addAnother(finalized);
        return instance;
    };
}
//# sourceMappingURL=mockProperties.js.map