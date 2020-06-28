import { IModel } from "@/types";
import { hashToArray } from "typed-conversions";
import { propertiesByModel } from "@/util";

export function getAllPropertiesFromClassStructure<T extends IModel>(model: T) {
  const modelName = model.constructor.name;
  const properties =
    hashToArray(propertiesByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model.constructor);

  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(
      ...hashToArray(propertiesByModel[subClassName], "property")
    );

    parent = Object.getPrototypeOf(subClass.constructor);
  }

  return properties.map((p) => p.property);
}
