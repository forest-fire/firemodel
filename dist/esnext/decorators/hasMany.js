import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./model-meta/relationship-store";
import { DecoratorProblem } from "../errors/decorators/DecoratorProblem";
import { modelNameLookup, modelConstructorLookup } from "../record/relationships/modelRegistration";
export function hasMany(
/**
 * either a _string_ representing the Model's class name
 * or a _constructor_ for the Model class
 *
 * In order to support prior implementations we include the
 * possibility that a user of this API will pass in a _function_
 * to a _constructor_. This approach is now deprecated.
 */
fkClass, inverse) {
    try {
        console.log("hasMany", fkClass);
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
            relType: "hasMany",
            directionality,
            fkConstructor
        };
        if (inverseProperty) {
            payload.inverseProperty = inverseProperty;
        }
        return propertyReflector(Object.assign(Object.assign({}, payload), { type: "Object" }), relationshipsByModel);
    }
    catch (e) {
        throw new DecoratorProblem("hasMany", e, { inverse });
    }
}
//# sourceMappingURL=hasMany.js.map