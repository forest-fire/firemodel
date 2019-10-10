"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reflector_1 = require("./reflector");
const property_store_1 = require("./model-meta/property-store");
// TODO: make the defaultValue typed
/**
 * Allows setting a default value for a given property
 */
function defaultValue(value) {
    return reflector_1.propertyReflector({ defaultValue: value }, property_store_1.propertiesByModel);
}
exports.defaultValue = defaultValue;
//# sourceMappingURL=defaultValue.js.map