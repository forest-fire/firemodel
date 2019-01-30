"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("../Record");
const ModelMeta_1 = require("../ModelMeta");
const reflector_1 = require("./reflector");
const decorator_1 = require("./decorator");
function belongsTo(fnToModelConstructor, inverse) {
    const modelConstructor = fnToModelConstructor();
    let model;
    let record;
    try {
        model = new modelConstructor();
        record = Record_1.Record.create(modelConstructor);
        let meta;
        if (record.META) {
            ModelMeta_1.addModelMeta(record.modelName, record.META);
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
        return reflector_1.propertyReflector(payload, decorator_1.relationshipsByModel);
    }
    catch (e) {
        e.name =
            e.name +
                `. The type passed into the decorator was ${typeof fnToModelConstructor} [should be function] and the resulting call to this returns typeof ${typeof model}`;
    }
}
exports.belongsTo = belongsTo;
exports.ownedBy = belongsTo;
exports.hasOne = belongsTo;
//# sourceMappingURL=belongsTo.js.map