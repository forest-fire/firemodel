"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstracted_firebase_1 = require("abstracted-firebase");
const fakeIt_1 = require("./fakeIt");
const NamedFakes_1 = require("./NamedFakes");
const PropertyNamePatterns_1 = require("./PropertyNamePatterns");
function mockValue(db, propMeta, ...rest) {
    if (!db || !(db instanceof abstracted_firebase_1.RealTimeDB)) {
        const e = new Error(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${typeof db === "object" ? db.constructor.name : db} ].`);
        console.log(e.message);
        // e.name = "FireModel::NotReady";
        // throw e;
    }
    // TODO: it appears FireMock is not sending back the proper context
    // so we are overwritting as least some for now
    const helper = db.mock.getMockHelper();
    helper.context = propMeta;
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