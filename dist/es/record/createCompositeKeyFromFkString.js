import { FireModelError } from "../errors";
import { capitalize } from "../util";
export function createCompositeKeyFromFkString(fkCompositeRef, modelConstructor) {
    const [id, ...paramsHash] = fkCompositeRef.split("::");
    const model = modelConstructor ? new modelConstructor() : undefined;
    return paramsHash
        .map(i => i.split(":"))
        .reduce((acc, curr) => {
        const [prop, value] = curr;
        acc[prop] = model
            ? setWithType(prop, value, model)
            : value;
        return acc;
    }, { id });
}
function setWithType(prop, value, model) {
    if (!model.META.property(prop)) {
        throw new FireModelError(`When building a "typed" composite key based on the model ${capitalize(model.constructor.name)}, the property "${prop}" was presented but this property doesn't exist on this model!`, "firemodel/property-does-not-exist");
    }
    const type = model.META.property(prop).type;
    switch (type) {
        case "number":
            return Number(value);
        case "boolean":
            return Boolean(value);
        default:
            return value;
    }
}
//# sourceMappingURL=createCompositeKeyFromFkString.js.map