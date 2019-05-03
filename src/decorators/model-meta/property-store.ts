import { IDictionary } from "common-types";
import { Model } from "../../Model";
import { hashToArray } from "typed-conversions";
import { IFmModelPropertyMeta } from "../types";

export function isProperty(modelKlass: IDictionary) {
  return (prop: string) => {
    return getModelProperty(modelKlass)(prop) ? true : false;
  };
}

/** Properties accumlated by propertyDecorators  */
export const propertiesByModel: IDictionary<
  IDictionary<IFmModelPropertyMeta>
> = {};

/** allows the addition of meta information to be added to a model's properties */
export function addPropertyToModelMeta<T extends Model = Model>(
  modelName: string,
  property: string,
  meta: IFmModelPropertyMeta<T>
) {
  if (!propertiesByModel[modelName]) {
    propertiesByModel[modelName] = {};
  }

  // TODO: investigate why we need to genericize to model (from <T>)
  propertiesByModel[modelName][property] = meta as IFmModelPropertyMeta<Model>;
}

/** lookup meta data for schema properties */
export function getModelProperty<T extends Model = Model>(model: T) {
  const className = model.constructor.name;
  const propsForModel = getProperties(model);

  return (prop: string) => {
    return propsForModel.find(value => {
      return value.property === prop;
    });
  };
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
