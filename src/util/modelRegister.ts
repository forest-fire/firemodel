import { IFnToModelConstructor, IModel, IModelConstructor } from "@/types";

// TODO: this is necessitated by the use of `Record` in some error classes
// which sets up a whole dependency chain
import { FireModelError } from "@/errors/FireModelError";
import { IDictionary } from "common-types";

const registeredModels: IDictionary<new () => any> = {};

/**
 * Registers a model's constructor so that it can be used by name. This
 * is sometime necessary due to circular dependencies.
 *
 * @param model a class constructor derived from `Model`
 */
export function modelRegister(...models: IModelConstructor[]) {
  models.forEach((model) => {
    if (!model) {
      throw new FireModelError(
        `An attempt was made to register a Model subclass but the passed in constructor was undefined!${
          models.length > 0
            ? ` [ ${models.length} models being registed during this call ]`
            : ""
        }`,
        "firemodel/not-allowed"
      );
    }
    if (typeof model !== "function" || !model.constructor) {
      throw new FireModelError(
        `An attempt was made to register a Model subclass but the passed in constructor was the wrong type [ ${typeof model} ]!\nmodel passed was: ${model}`,
        "firemodel/not-allowed"
      );
    }

    const modelName = new model().constructor.name;
    registeredModels[modelName] = model;
  });
}

export function listRegisteredModels() {
  return Object.keys(registeredModels);
}

export function modelRegistryLookup(name: string) {
  const model = registeredModels[name];
  if (!name) {
    throw new FireModelError(
      `Look failed because the model ${name} was not registered!`,
      "firemodel/not-allowed"
    );
  }

  return model;
}

/**
 * When you are building relationships to other `Model`'s it is often
 * benefitial to just pass in the name of the `Model` rather than it's
 * constructor as this avoids the dreaded "circular dependency" problem
 * that occur when you try to pass in class constructors which depend
 * on one another.
 */
export const modelNameLookup = (name: string) => (): IModelConstructor => {
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
export const modelConstructorLookup = <T extends IModel>(
  constructor: IModelConstructor<T> | IFnToModelConstructor<T>
) => (): IModelConstructor => {
  // TODO: remove the "any"
  return isConstructable(constructor) ? constructor : (constructor as any)();
};

// tslint:disable-next-line: ban-types
export function isConstructable(fn: IModelConstructor | IFnToModelConstructor) {
  try {
    const f = new (fn as IModelConstructor)();

    return true;
  } catch (e) {
    return false;
  }
}
