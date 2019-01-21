import "reflect-metadata";
import { relationshipsByModel } from "./decorator";
import { Record } from "../Record";
import { addModelMeta } from "../ModelMeta";
import { propertyReflector } from "./reflector";
export function hasMany(modelConstructor) {
    const rec = Record.create(modelConstructor());
    let meta = {};
    if (rec.META) {
        addModelMeta(rec.modelName, rec.META);
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
    return propertyReflector(payload, relationshipsByModel);
}
export function belongsTo(modelConstructor) {
    return ownedBy(modelConstructor);
}
export function ownedBy(modelConstructor) {
    const rec = Record.create(modelConstructor());
    let meta;
    if (rec.META) {
        addModelMeta(rec.modelName, rec.META);
        meta = rec.META;
    }
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "ownedBy",
        fkConstructor: modelConstructor,
        fkModelName: rec.modelName
    };
    return propertyReflector(payload, relationshipsByModel);
}
export function inverse(inverseProperty) {
    return propertyReflector({ inverseProperty }, relationshipsByModel);
}
//# sourceMappingURL=relationship.js.map