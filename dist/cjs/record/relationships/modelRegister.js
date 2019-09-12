"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../errors/index");
const registeredModules = {};
/**
 * Registered a model's constructor so that it can be used by name. This
 * is sometime necessary due to circular dependencies.
 *
 * @param model a class constructor derived from `Model`
 */
function modelRegister(model) {
    if (!model) {
        throw new index_1.FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was undefined!`, "firemodel/not-allowed");
    }
    if (typeof model !== "function" || !model.constructor) {
        throw new index_1.FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was the wrong type [ ${typeof model} ]!\nmodel passed was: ${model}`, "firemodel/not-allowed");
    }
    const modelName = model.constructor.name;
    registeredModules[modelName] = model;
}
exports.modelRegister = modelRegister;
function listRegisteredModels() {
    return Object.keys(registeredModules);
}
exports.listRegisteredModels = listRegisteredModels;
function modelLookup(name) {
    const model = registeredModules[name];
    if (!name) {
        throw new index_1.FireModelError(`The model ${name} was NOT registered!`, "firemodel/not-allowed");
    }
    return model;
}
exports.modelLookup = modelLookup;
//# sourceMappingURL=modelRegister.js.map