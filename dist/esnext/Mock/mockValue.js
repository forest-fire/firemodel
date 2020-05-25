import { NamedFakes, PropertyNamePatterns, fakeIt } from "./index";
export function mockValue(db, propMeta, mockHelper, ...rest) {
    mockHelper.context = propMeta;
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