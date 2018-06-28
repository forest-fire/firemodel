"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const decorator_1 = require("./decorator");
const Record_1 = require("../Record");
const ModelMeta_1 = require("../ModelMeta");
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
    return decorator_1.propertyDecorator(payload, "property");
}
exports.hasMany = hasMany;
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
    return decorator_1.propertyDecorator(payload, "property");
}
exports.ownedBy = ownedBy;
function inverse(inverseProperty) {
    return decorator_1.propertyDecorator({ inverseProperty });
}
exports.inverse = inverse;
//# sourceMappingURL=relationship.js.map