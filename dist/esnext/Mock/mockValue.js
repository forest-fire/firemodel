import { AbstractedDatabase } from "abstracted-database";
import fakeIt from "./fakeIt";
import NamedFakes from "./NamedFakes";
import PropertyNamePatterns from "./PropertyNamePatterns";
import { MockError } from "../errors";
export default function mockValue(db, propMeta, mockHelper, ...rest) {
    mockHelper.context = propMeta;
    if (!db || !(db instanceof AbstractedDatabase)) {
        // Change this!
        throw new MockError(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the Database provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${typeof db === "object" ? db.constructor.name : db} ].`);
    }
    const { type, mockType, mockParameters } = propMeta;
    if (mockType) {
        // MOCK is defined
        return typeof mockType === "function"
            ? mockType(mockHelper)
            : fakeIt(mockHelper, mockType, ...(mockParameters || []));
    }
    else {
        // MOCK is undefined
        const fakedMockType = (Object.keys(NamedFakes).includes(propMeta.property)
            ? PropertyNamePatterns[propMeta.property]
            : type);
        return fakeIt(mockHelper, fakedMockType, ...(mockParameters || []));
    }
}
//# sourceMappingURL=mockValue.js.map