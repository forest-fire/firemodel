import { Model, Record, ICompositeKey } from "..";

export function createCompositeKey<T extends Model = Model>(
  rec: Record<T>
): ICompositeKey {
  const model = rec.data;
  return {
    ...{ id: rec.id },
    ...rec.dynamicPathComponents.reduce(
      (prev, key) => ({
        ...prev,
        ...{ [key]: model[key as keyof typeof model] }
      }),
      {}
    )
  };
}
