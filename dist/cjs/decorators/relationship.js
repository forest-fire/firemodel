"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const decorator_1 = require("./decorator");
const Record_1 = require("../Record");
const ModelMeta_1 = require("../ModelMeta");
const reflector_1 = require("./reflector");
function hasMany(modelConstructor) {
    const rec = Record_1.Record.create(modelConstructor);
    let meta = {};
    if (rec.META) {
        ModelMeta_1.addModelMeta(rec.modelName, rec.META);
        meta = rec.META;
    }
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "hasMany",
        fkConstructor: modelConstructor,
        fkModelName: rec.modelName,
        fkPluralName: rec.pluralName
    };
    return reflector_1.propertyReflector(payload, decorator_1.relationshipsByModel);
}
exports.hasMany = hasMany;
function belongsTo(modelConstructor) {
    return ownedBy(modelConstructor);
}
exports.belongsTo = belongsTo;
function ownedBy(modelConstructor) {
    const rec = Record_1.Record.create(modelConstructor);
    let meta;
    if (rec.META) {
        ModelMeta_1.addModelMeta(rec.modelName, rec.META);
        meta = rec.META;
    }
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "ownedBy",
        fkConstructor: modelConstructor,
        fkModelName: rec.modelName
    };
    return reflector_1.propertyReflector(payload, decorator_1.relationshipsByModel);
}
exports.ownedBy = ownedBy;
function inverse(inverseProperty) {
    return reflector_1.propertyReflector({ inverseProperty }, decorator_1.relationshipsByModel);
}
exports.inverse = inverse;
//# sourceMappingURL=relationship.js.map