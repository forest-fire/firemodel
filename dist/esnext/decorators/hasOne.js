import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./model-meta/relationship-store";
import { DecoratorProblem } from "../errors/decorators/DecoratorProblem";
import { modelLookup } from "../record/relationships/modelRegistration";
export function belongsTo(fnToModelConstructor, inverse) {
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
            relType: "hasOne",
            directionality,
            fkConstructor: fnToModelConstructor
        };
        if (inverseProperty) {
            payload.inverseProperty = inverseProperty;
        }
        return propertyReflector(Object.assign(Object.assign({}, payload), { type: "String" }), relationshipsByModel);
    }
    catch (e) {
        throw new DecoratorProblem("hasOne", e, { inverse });
    }
}
export const ownedBy = belongsTo;
export const hasOne = belongsTo;
//# sourceMappingURL=hasOne.js.map