"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const private_1 = require("@/private");
function mock(value, ...rest) {
    return private_1.propertyReflector({ mockType: value, mockParameters: rest }, private_1.propertiesByModel);
}
exports.mock = mock;
//# sourceMappingURL=mock.js.map