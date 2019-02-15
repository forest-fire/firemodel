"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reflector_1 = require("./reflector");
const decorator_1 = require("./decorator");
function hasMany(fnToModelConstructor, inverse) {
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "hasMany",
        fkConstructor: fnToModelConstructor,
    };
    if (inverse) {
        payload.inverseProperty = inverse;
    }
    return reflector_1.propertyReflector(payload, decorator_1.relationshipsByModel);
}
exports.hasMany = hasMany;
//# sourceMappingURL=hasMany.js.map