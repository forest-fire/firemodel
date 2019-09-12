import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./model-meta/relationship-store";
import { DecoratorProblem } from "../errors/decorators/DecoratorProblem";
import { modelLookup } from "../record/relationships/modelRegistration";
export function hasMany(fnToModelConstructor, inverse) {
    if (typeof fnToModelConstructor === "string") {
        const model = modelLookup(fnToModelConstructor);
        // if (!model) {
        //   throw new FireModelError(
        //     `attempt to lookup "${fnToModelConstructor}" as pre-registered Model failed! ${
        //       inverse ? `[ inverse prop was "${inverse}"]` : ""
        //     }. The registered models found were: ${FireModel.registeredModules().join(
        //       ", "
        //     )}`,
        //     `firemodel/not-allowed`
        //   );
        // }
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
            relType: "hasMany",
            directionality,
            fkConstructor: fnToModelConstructor
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