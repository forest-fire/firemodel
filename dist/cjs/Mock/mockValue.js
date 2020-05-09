"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstracted_database_1 = require("@forest-fire/abstracted-database");
const fakeIt_1 = __importDefault(require("./fakeIt"));
const NamedFakes_1 = __importDefault(require("./NamedFakes"));
const PropertyNamePatterns_1 = __importDefault(require("./PropertyNamePatterns"));
const errors_1 = require("../errors");
function mockValue(db, propMeta, mockHelper, ...rest) {
    mockHelper.context = propMeta;
    if (!db || !(db instanceof abstracted_database_1.AbstractedDatabase)) {
        // Change this!
        throw new errors_1.MockError(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the Database provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${typeof db === "object" ? db.constructor.name : db} ].`);
    }
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