import "reflect-metadata";
import { propertyDecorator } from "./decorator";
import { Record } from "../Record";
import { addModelMeta } from "../ModelMeta";
export function hasMany(modelConstructor) {
    const rec = Record.create(modelConstructor);
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
    return propertyDecorator(payload, "property");
}
export function ownedBy(modelConstructor) {
    const rec = Record.create(modelConstructor);
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
    return propertyDecorator(payload, "property");
}
export function inverse(inverseProperty) {
    return propertyDecorator({ inverseProperty });
}
//# sourceMappingURL=relationship.js.map