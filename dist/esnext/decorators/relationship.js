import "reflect-metadata";
import { propertyDecorator } from "./decorator";
export function hasMany(schemaClass) {
    return propertyDecorator({
        isRelationship: true,
        isProperty: false,
        relType: "hasMany",
        fkConstructor: schemaClass
    }, "property");
}
export function ownedBy(schemaClass) {
    return propertyDecorator({
        isRelationship: true,
        isProperty: false,
        relType: "ownedBy",
        fkConstructor: schemaClass
    }, "property");
}
export function inverse(inverseProperty) {
    return propertyDecorator({ inverseProperty });
}
//# sourceMappingURL=relationship.js.map