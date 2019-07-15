import { RealTimeDB } from "abstracted-firebase";
import fakeIt from "./fakeIt";
import NamedFakes from "./NamedFakes";
import PropertyNamePatterns from "./PropertyNamePatterns";
import { MockHelper } from "firemock";
import { MockError } from "../errors";
export default function mockValue(db, propMeta, ...rest) {
    if (!db || !(db instanceof RealTimeDB)) {
        throw new MockError(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${typeof db === "object" ? db.constructor.name : db} ].`);
    }
    const helper = new MockHelper(propMeta);
    const { type, mockType, mockParameters } = propMeta;
    if (mockType) {
        // MOCK is defined
        return typeof mockType === "function"
            ? mockType(helper)
            : fakeIt(helper, mockType, ...(mockParameters || []));
    }
    else {
        // MOCK is undefined
        const fakedMockType = (Object.keys(NamedFakes).includes(propMeta.property)
            ? PropertyNamePatterns[propMeta.property]
            : type);
        return fakeIt(helper, fakedMockType, ...(mockParameters || []));
    }
}
//# sourceMappingURL=mockValue.js.map