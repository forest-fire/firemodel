"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mock = void 0;
const reflector_1 = require("./reflector");
const property_store_1 = require("./model-meta/property-store");
function mock(value, ...rest) {
    return reflector_1.propertyReflector({ mockType: value, mockParameters: rest }, property_store_1.propertiesByModel);
}
exports.mock = mock;
//# sourceMappingURL=mock.js.map