import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./decorator";
export function belongsTo(fnToModelConstructor, inverse) {
    try {
        const payload = {
            isRelationship: true,
            isProperty: false,
            relType: "hasOne",
            fkConstructor: fnToModelConstructor
        };
        if (inverse) {
            payload.inverseProperty = inverse;
        }
        return propertyReflector(payload, relationshipsByModel);
    }
    catch (e) {
        e.name =
            e.name +
                `. The type passed into the decorator was ${typeof fnToModelConstructor} [should be function]`;
        throw e;
    }
}
export const ownedBy = belongsTo;
export const hasOne = belongsTo;
//# sourceMappingURL=belongsTo.js.map