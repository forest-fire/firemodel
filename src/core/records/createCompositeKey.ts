import { ICompositeKey, IModel } from "@/types";

import { FireModelError } from "@/errors";
import { Record } from "@/core";
import { capitalize } from "@/util";

/**
 * Given a `Record` which defines all properties in it's
 * "dynamic segments" as well as an `id`; this function returns
 * an object representation of the composite key.
 */
export function createCompositeKey<T extends IModel = IModel>(
  rec: Record<T>
): ICompositeKey<T> {
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
          `You can not create a composite key on a ${capitalize(
            rec.modelName
          )} without first setting the '${key}' property!`,
          "firemodel/not-ready"
        );
      }
      return {
        ...prev,
        ...{ [key]: model[key as keyof typeof model] },
      };
    },
    {}
  );

  return rec.dynamicPathComponents.reduce(
    (prev, key) => ({
      ...prev,
      ...dynamicPathComponents,
    }),
    { id: rec.id }
  ) as ICompositeKey<T>;
}
