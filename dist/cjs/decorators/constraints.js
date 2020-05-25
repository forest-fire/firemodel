"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushKey = exports.property = exports.length = exports.max = exports.min = exports.desc = exports.constrain = exports.constrainedProperty = void 0;
require("reflect-metadata");
const property_store_1 = require("./model-meta/property-store");
const reflector_1 = require("./reflector");
function constrainedProperty(options = {}) {
    return reflector_1.propertyReflector(Object.assign(Object.assign({}, options), { isRelationship: false, isProperty: true }), property_store_1.propertiesByModel);
}
exports.constrainedProperty = constrainedProperty;
/** allows the introduction of a new constraint to the metadata of a property */
function constrain(prop, value) {
    return reflector_1.propertyReflector({ [prop]: value }, property_store_1.propertiesByModel);
}
exports.constrain = constrain;
function desc(value) {
    return reflector_1.propertyReflector({ desc: value }, property_store_1.propertiesByModel);
}
exports.desc = desc;
function min(value) {
    return reflector_1.propertyReflector({ min: value }, property_store_1.propertiesByModel);
}
exports.min = min;
function max(value) {
    return reflector_1.propertyReflector({ max: value }, property_store_1.propertiesByModel);
}
exports.max = max;
function length(value) {
    return reflector_1.propertyReflector({ length: value }, property_store_1.propertiesByModel);
}
exports.length = length;
exports.property = reflector_1.propertyReflector({
    isRelationship: false,
    isProperty: true,
}, property_store_1.propertiesByModel);
exports.pushKey = reflector_1.propertyReflector({ pushKey: true }, property_store_1.propertiesByModel);
//# sourceMappingURL=constraints.js.map