import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./model-meta/relationship-store";
export function hasMany(fnToModelConstructor, inverse) {
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "hasMany",
        fkConstructor: fnToModelConstructor
    };
    if (inverse) {
        payload.inverseProperty = inverse;
    }
    return propertyReflector(payload, relationshipsByModel);
}
//# sourceMappingURL=hasMany.js.map