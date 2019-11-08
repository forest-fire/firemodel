import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./model-meta/relationship-store";
import { DecoratorProblem } from "../errors/decorators/DecoratorProblem";
import { modelNameLookup, modelConstructorLookup } from "../record/relationships/modelRegistration";
export function belongsTo(
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
            ? modelNameLookup(fkClass)
            : modelConstructorLookup(fkClass);
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
            fkConstructor
        };
        if (inverseProperty) {
            payload.inverseProperty = inverseProperty;
        }
        return propertyReflector(Object.assign({}, payload, { type: "String" }), relationshipsByModel);
    }
    catch (e) {
        throw new DecoratorProblem("hasOne", e, { inverse });
    }
}
export const ownedBy = belongsTo;
export const hasOne = belongsTo;
//# sourceMappingURL=hasOne.js.map