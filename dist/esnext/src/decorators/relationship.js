import "reflect-metadata";
import { propertyDecorator } from "./decorator";
import { Record } from "../Record";
export function hasMany(modelConstructor) {
    const rec = Record.create(modelConstructor);
    console.log(rec.modelName);
    console.log(rec.META);
    return propertyDecorator({
        isRelationship: true,
        isProperty: false,
        relType: "hasMany",
        fkConstructor: modelConstructor,
        fkModelName: rec ? rec.modelName : null
    }, "property");
}
export function ownedBy(modelConstructor) {
    const rec = Record.create(modelConstructor);
    console.log(rec.modelName);
    return propertyDecorator({
        isRelationship: true,
        isProperty: false,
        relType: "ownedBy",
        fkConstructor: modelConstructor,
        fkModelName: rec.modelName
    }, "property");
}
export function inverse(inverseProperty) {
    return propertyDecorator({ inverseProperty });
}
//# sourceMappingURL=relationship.js.map