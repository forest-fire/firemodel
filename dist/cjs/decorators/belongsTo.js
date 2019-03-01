"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reflector_1 = require("./reflector");
const relationship_store_1 = require("./model-meta/relationship-store");
function belongsTo(fnToModelConstructor, inverse) {
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
        return reflector_1.propertyReflector(payload, relationship_store_1.relationshipsByModel);
    }
    catch (e) {
        e.name =
            e.name +
                `. The type passed into the decorator was ${typeof fnToModelConstructor} [should be function]`;
        throw e;
    }
}
exports.belongsTo = belongsTo;
exports.ownedBy = belongsTo;
exports.hasOne = belongsTo;
//# sourceMappingURL=belongsTo.js.map