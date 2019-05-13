import { Model, Record, ICompositeKey } from "..";
import { FireModelError } from "../errors";

/**
 * Given a `Record` which defines all properties in it's
 * "dynamic segments" as well as an `id`; this function returns
 * an object representation of the composite key.
 */
export function createCompositeKey<T extends Model = Model>(
  rec: Record<T>
): ICompositeKey {
  const model = rec.data;
  if (!rec.id) {
    throw new FireModelError(
      `You can not create a composite key without first setting the 'id' property!`,
      "firemodel/not-ready"
    );
  }
  const dynamicPathComponents = rec.dynamicPathComponents.reduce(
    (prev, key) => {
      if (!model[key as keyof typeof model]) {
        throw new FireModelError(
          `You can create a composite key without first setting the '${key}' property!`,
          "firemodel/not-ready"
        );
      }
      return {
        ...prev,
        ...{ [key]: model[key as keyof typeof model] }
      };
    },
    {}
  );

  return {
    ...{ id: rec.id },
    ...rec.dynamicPathComponents.reduce(
      (prev, key) => ({
        ...prev,
        ...dynamicPathComponents
      }),
      {}
    )
  };
}
