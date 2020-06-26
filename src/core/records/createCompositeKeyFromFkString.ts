import { FireModelError } from "@errors";
import { ICompositeKey } from "@types";
import { Model } from "@/models";
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
          ? setWithType<T>(prop, value, model)
          : value;
        return acc;
      },
      { id }
    );
}

function setWithType<T extends Model>(prop: string, value: string, model: T) {
  if (!model.META.property(prop)) {
    throw new FireModelError(
      `When building a "typed" composite key based on the model ${capitalize(
        model.constructor.name
      )}, the property "${prop}" was presented but this property doesn't exist on this model!`,
      "firemodel/property-does-not-exist"
    );
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
