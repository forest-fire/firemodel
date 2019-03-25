import { RealTimeDB } from "abstracted-firebase";
import fakeIt from "./fakeIt";
import NamedFakes from "./NamedFakes";
import PropertyNamePatterns from "./PropertyNamePatterns";
import { MockHelper } from "firemock";
export default function mockValue(db, propMeta, ...rest) {
    if (!db || !(db instanceof RealTimeDB)) {
        const e = new Error(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${typeof db === "object" ? db.constructor.name : db} ].`);
        console.log(e.message);
        e.name = "FireModel::NotReady";
        throw e;
    }
    const helper = new MockHelper(propMeta);
    const { type, mockType, mockParameters } = propMeta;
    if (mockType) {
        return typeof mockType === "function"
            ? mockType(helper)
            : fakeIt(helper, mockType, mockParameters);
    }
    else {
        return fakeIt(helper, (Object.keys(NamedFakes).includes(propMeta.property)
            ? PropertyNamePatterns[propMeta.property]
            : type), mockParameters);
    }
}
//# sourceMappingURL=mockValue.js.map