"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstracted_firebase_1 = require("abstracted-firebase");
const fakeIt_1 = __importDefault(require("./fakeIt"));
const NamedFakes_1 = __importDefault(require("./NamedFakes"));
const PropertyNamePatterns_1 = __importDefault(require("./PropertyNamePatterns"));
const firemock_1 = require("firemock");
const errors_1 = require("../errors");
function mockValue(db, propMeta, ...rest) {
    if (!db || !(db instanceof abstracted_firebase_1.RealTimeDB)) {
        throw new errors_1.MockError(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${typeof db === "object" ? db.constructor.name : db} ].`);
    }
    const helper = new firemock_1.MockHelper(propMeta);
    const { type, mockType, mockParameters } = propMeta;
    if (mockType) {
        return typeof mockType === "function"
            ? mockType(helper)
            : fakeIt_1.default(helper, mockType, mockParameters);
    }
    else {
        return fakeIt_1.default(helper, (Object.keys(NamedFakes_1.default).includes(propMeta.property)
            ? PropertyNamePatterns_1.default[propMeta.property]
            : type), mockParameters);
    }
}
exports.default = mockValue;
//# sourceMappingURL=mockValue.js.map