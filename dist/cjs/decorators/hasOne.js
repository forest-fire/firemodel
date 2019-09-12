"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reflector_1 = require("./reflector");
const relationship_store_1 = require("./model-meta/relationship-store");
const DecoratorProblem_1 = require("../errors/decorators/DecoratorProblem");
const index_1 = require("../index");
const FireModelError_1 = require("../errors/FireModelError");
function belongsTo(fnToModelConstructor, inverse) {
    if (typeof fnToModelConstructor === "string") {
        const model = index_1.FireModel.lookupModel(fnToModelConstructor);
        if (!model) {
            throw new FireModelError_1.FireModelError(`attempt to lookup "${fnToModelConstructor}" as pre-registered Model failed! ${inverse ? `[ inverse prop was "${inverse}"]` : ""}`, `firemodel/not-allowed`);
        }
        fnToModelConstructor = () => model;
    }
    try {
        let inverseProperty;
        let directionality;
        if (Array.isArray(inverse)) {
            [inverseProperty, directionality] = inverse;
        }
        else {
            inverseProperty = inverse;
            directionality = inverse ? "bi-directional" : "one-way";
        }
        const payload = {
            isRelationship: true,
            isProperty: false,
            relType: "hasOne",
            directionality,
            fkConstructor: fnToModelConstructor
        };
        if (inverseProperty) {
            payload.inverseProperty = inverseProperty;
        }
        return reflector_1.propertyReflector(Object.assign(Object.assign({}, payload), { type: "String" }), relationship_store_1.relationshipsByModel);
    }
    catch (e) {
        throw new DecoratorProblem_1.DecoratorProblem("hasOne", e, { inverse });
    }
}
exports.belongsTo = belongsTo;
exports.ownedBy = belongsTo;
exports.hasOne = belongsTo;
//# sourceMappingURL=hasOne.js.map