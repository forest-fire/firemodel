"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOne = exports.ownedBy = exports.belongsTo = void 0;
const private_1 = require("@/private");
function belongsTo(
/**
 * either a _string_ representing the Model's class name
 * or a _constructor_ for the Model class.
 *
 * In order to support prior implementations we include the
 * possibility that a user of this API will pass in a _function_
 * to a _constructor_. This approach is now deprecated.
 */
fkClass, inverse) {
    try {
        const fkConstructor = typeof fkClass === "string"
            ? private_1.modelNameLookup(fkClass)
            : private_1.modelConstructorLookup(fkClass);
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
            fkConstructor,
        };
        if (inverseProperty) {
            payload.inverseProperty = inverseProperty;
        }
        return private_1.propertyReflector({ ...payload, type: "String" }, private_1.relationshipsByModel);
    }
    catch (e) {
        throw new private_1.DecoratorProblem("hasOne", e, { inverse });
    }
}
exports.belongsTo = belongsTo;
exports.ownedBy = belongsTo;
exports.hasOne = belongsTo;
//# sourceMappingURL=hasOne.js.map