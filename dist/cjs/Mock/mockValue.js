"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fakeIt_1 = __importDefault(require("./fakeIt"));
const NamedFakes_1 = __importDefault(require("./NamedFakes"));
const PropertyNamePatterns_1 = __importDefault(require("./PropertyNamePatterns"));
function mockValue(db, propMeta, mockHelper, ...rest) {
    mockHelper.context = propMeta;
    const { type, mockType, mockParameters } = propMeta;
    if (mockType) {
        // MOCK is defined
        return typeof mockType === "function"
            ? mockType(mockHelper)
            : fakeIt_1.default(mockHelper, mockType, ...(mockParameters || []));
    }
    else {
        // MOCK is undefined
        const fakedMockType = (Object.keys(NamedFakes_1.default).includes(propMeta.property)
            ? PropertyNamePatterns_1.default[propMeta.property]
            : type);
        return fakeIt_1.default(mockHelper, fakedMockType, ...(mockParameters || []));
    }
}
exports.default = mockValue;
//# sourceMappingURL=mockValue.js.map