"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockValue = void 0;
const index_1 = require("./index");
function mockValue(db, propMeta, mockHelper, ...rest) {
    mockHelper.context = propMeta;
    const { type, mockType, mockParameters } = propMeta;
    if (mockType) {
        // MOCK is defined
        return typeof mockType === "function"
            ? mockType(mockHelper)
            : index_1.fakeIt(mockHelper, mockType, ...(mockParameters || []));
    }
    else {
        // MOCK is undefined
        const fakedMockType = (Object.keys(index_1.NamedFakes).includes(propMeta.property)
            ? index_1.PropertyNamePatterns[propMeta.property]
            : type);
        return index_1.fakeIt(mockHelper, fakedMockType, ...(mockParameters || []));
    }
}
exports.mockValue = mockValue;
//# sourceMappingURL=mockValue.js.map