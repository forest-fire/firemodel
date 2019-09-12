import { FireModelError } from "../../errors/index";
const registeredModels = {};
/**
 * Registered a model's constructor so that it can be used by name. This
 * is sometime necessary due to circular dependencies.
 *
 * @param model a class constructor derived from `Model`
 */
export function modelRegister(model) {
    if (!model) {
        throw new FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was undefined!`, "firemodel/not-allowed");
    }
    if (typeof model !== "function" || !model.constructor) {
        throw new FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was the wrong type [ ${typeof model} ]!\nmodel passed was: ${model}`, "firemodel/not-allowed");
    }
    const modelName = model.constructor.name;
    registeredModels[modelName] = model;
}
export function listRegisteredModels() {
    return Object.keys(registeredModels);
}
export function modelLookup(name) {
    const model = registeredModels[name];
    if (!name) {
        throw new FireModelError(`The model ${name} was NOT registered!`, "firemodel/not-allowed");
    }
    return model;
}
//# sourceMappingURL=modelRegistration.js.map