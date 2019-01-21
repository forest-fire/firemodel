import { Record } from "../Record";
import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./decorator";
export function hasMany(fnToModelConstructor, inverse) {
    const modelConstructor = fnToModelConstructor();
    const model = new modelConstructor();
    const record = Record.create(modelConstructor);
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
    return propertyReflector(payload, relationshipsByModel);
}
//# sourceMappingURL=hasMany.js.map