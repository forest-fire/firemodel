import { IDictionary } from "common-types";
import { IFmModelPropertyMeta } from "../schema";
import { Model } from "../../Model";
import { hashToArray } from "typed-conversions";

/** Properties accumlated by propertyDecorators  */
export const propertiesByModel: IDictionary<
  IDictionary<IFmModelPropertyMeta>
> = {};

/** lookup meta data for schema properties */
function getModelProperty<T extends Model = Model>(modelKlass: IDictionary) {
  const className = modelKlass.constructor.name;

  return (prop: string) =>
    (({ ...propertiesByModel[className], ...propertiesByModel.Model } || {})[
      prop
    ]);
}

/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
export function getProperties<T extends Model>(model: T) {
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

  return properties;
}
