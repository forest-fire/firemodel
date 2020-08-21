import { ICompositeKey, IModel } from "@/types";

import { FireModelError } from "@/errors";
import { capitalize } from "@/util";

export function createCompositeKeyFromFkString<T = ICompositeKey>(
  fkCompositeRef: string,
  modelConstructor?: new () => T
): ICompositeKey<T> {
  const [id, ...paramsHash] = fkCompositeRef.split("::");
  const model: T = modelConstructor ? new modelConstructor() : undefined;

  return paramsHash
    .map((i) => i.split(":"))
    .reduce(
      (acc: any, curr) => {
        const [prop, value] = curr;
        acc[prop as keyof ICompositeKey<T>] = model
          ? setWithType<T>(prop as keyof T & string, value, model)
          : value;
        return acc;
      },
      { id }
    );
}

/**
 * Sets the props in the composite key to the appropriate _type_.
 * This is needed because a string-based FK reference provides name/value
 * pairs but type information is lost in this format and must be returned
 * to full fidelity.
 */
function setWithType<T extends IModel>(
  prop: keyof T & string,
  value: string,
  model: T
) {
  const isProp = model.META.isProperty(prop);
  const isRel = model.META.isRelationship(prop);
  if (!isProp && !isRel) {
    throw new FireModelError(
      `Failed to identify the type for property "${prop}" on a model because this property is neither a value or a relationship property on this model!`,
      "invalid-composite-key"
    );
  }
  const type = isProp
    ? model.META.property(prop).type
    : model.META.relationship(prop).type;

  if (!type) {
    throw new FireModelError(
      `When building a composite key for the model ${capitalize(
        model.constructor.name
      )}, the property "${prop}" was presented but this property doesn't exist on this model! `,
      "firemodel/property-does-not-exist"
    );
  }

  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return Boolean(value);

    default:
      return value;
  }
}
