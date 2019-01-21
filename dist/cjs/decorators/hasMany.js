"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("../Record");
const reflector_1 = require("./reflector");
const decorator_1 = require("./decorator");
function hasMany(fnToModelConstructor, inverse) {
    const modelConstructor = fnToModelConstructor();
    const model = new modelConstructor();
    const record = Record_1.Record.create(modelConstructor);
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "hasMany",
        fkConstructor: fnToModelConstructor(),
        fkModelName: record.modelName,
        fkPluralName: record.pluralName
    };
    if (inverse) {
        payload.inverseProperty = inverse;
    }
    return reflector_1.propertyReflector(payload, decorator_1.relationshipsByModel);
}
exports.hasMany = hasMany;
//# sourceMappingURL=hasMany.js.map