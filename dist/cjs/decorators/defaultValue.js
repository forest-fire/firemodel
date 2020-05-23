"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValue = void 0;
const private_1 = require("@/private");
// TODO: make the defaultValue typed
/**
 * Allows setting a default value for a given property
 */
function defaultValue(value) {
    return private_1.propertyReflector({ defaultValue: value }, private_1.propertiesByModel);
}
exports.defaultValue = defaultValue;
//# sourceMappingURL=defaultValue.js.map