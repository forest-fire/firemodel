"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const private_1 = require("@/private");
function constrainedProperty(options = {}) {
    return private_1.propertyReflector({
        ...options,
        ...{ isRelationship: false, isProperty: true },
    }, private_1.propertiesByModel);
}
exports.constrainedProperty = constrainedProperty;
/** allows the introduction of a new constraint to the metadata of a property */
function constrain(prop, value) {
    return private_1.propertyReflector({ [prop]: value }, private_1.propertiesByModel);
}
exports.constrain = constrain;
function desc(value) {
    return private_1.propertyReflector({ desc: value }, private_1.propertiesByModel);
}
exports.desc = desc;
function min(value) {
    return private_1.propertyReflector({ min: value }, private_1.propertiesByModel);
}
exports.min = min;
function max(value) {
    return private_1.propertyReflector({ max: value }, private_1.propertiesByModel);
}
exports.max = max;
function length(value) {
    return private_1.propertyReflector({ length: value }, private_1.propertiesByModel);
}
exports.length = length;
exports.property = private_1.propertyReflector({
    isRelationship: false,
    isProperty: true,
}, private_1.propertiesByModel);
exports.pushKey = private_1.propertyReflector({ pushKey: true }, private_1.propertiesByModel);
//# sourceMappingURL=constraints.js.map