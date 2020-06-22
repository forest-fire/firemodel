"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConstructable = exports.modelConstructorLookup = exports.modelNameLookup = exports.modelRegistryLookup = exports.listRegisteredModels = exports.modelRegister = void 0;
const FireModelError_1 = require("../../errors/FireModelError");
const registeredModels = {};
/**
 * Registered a model's constructor so that it can be used by name. This
 * is sometime necessary due to circular dependencies.
 *
 * @param model a class constructor derived from `Model`
 */
function modelRegister(...models) {
    models.forEach(model => {
        if (!model) {
            throw new FireModelError_1.FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was undefined!${models.length > 0
                ? ` [ ${models.length} models being registed during this call ]`
                : ""}`, "firemodel/not-allowed");
        }
        if (typeof model !== "function" || !model.constructor) {
            throw new FireModelError_1.FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was the wrong type [ ${typeof model} ]!\nmodel passed was: ${model}`, "firemodel/not-allowed");
        }
        const modelName = new model().constructor.name;
        registeredModels[modelName] = model;
    });
}
exports.modelRegister = modelRegister;
function listRegisteredModels() {
    return Object.keys(registeredModels);
}
exports.listRegisteredModels = listRegisteredModels;
function modelRegistryLookup(name) {
    const model = registeredModels[name];
    if (!name) {
        throw new FireModelError_1.FireModelError(`Look failed because the model ${name} was not registered!`, "firemodel/not-allowed");
    }
    return model;
}
exports.modelRegistryLookup = modelRegistryLookup;
/**
 * When you are building relationships to other `Model`'s it is often
 * benefitial to just pass in the name of the `Model` rather than it's
 * constructor as this avoids the dreaded "circular dependency" problem
 * that occur when you try to pass in class constructors which depend
 * on one another.
 */
exports.modelNameLookup = (name) => () => {
    return modelRegistryLookup(name);
};
/**
 * When you are defining a _relationship_ between `Model`'s it sometimes
 * useful to just pass in the constructor to the other `Model`. This is in
 * contrast to just passing a string name of the model.
 *
 * The advantage here is that the external model does not need to be
 * "registered" separately whereas with a string name it would have to be.
 */
exports.modelConstructorLookup = (constructor) => () => {
    // TODO: remove the "any"
    return isConstructable(constructor) ? constructor : constructor();
};
// tslint:disable-next-line: ban-types
function isConstructable(fn) {
    try {
        const f = new fn();
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isConstructable = isConstructable;
//# sourceMappingURL=modelRegistration.js.map