import { Record } from "../Record";
import { addModelMeta } from "../ModelMeta";
import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./decorator";
export function belongsTo(fnToModelConstructor, inverse) {
    const modelConstructor = fnToModelConstructor();
    const model = new modelConstructor();
    const record = Record.create(modelConstructor);
    let meta;
    if (record.META) {
        addModelMeta(record.modelName, record.META);
        meta = record.META;
    }
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "hasOne",
        fkConstructor: modelConstructor,
        fkModelName: record.modelName,
        fkPluralName: record.pluralName
    };
    if (inverse) {
        payload.inverseProperty = inverse;
    }
    return propertyReflector(payload, relationshipsByModel);
}
export const ownedBy = belongsTo;
export const hasOne = belongsTo;
//# sourceMappingURL=belongsTo.js.map