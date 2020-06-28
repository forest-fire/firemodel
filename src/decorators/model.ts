import "reflect-metadata";

import { FmModelConstructor, IFmModelMeta, IModel } from "@/types";
import {
  addModelMeta,
  getModelProperty,
  getModelRelationship,
  getProperties,
  getRelationships,
  isProperty,
  isRelationship,
} from "@/util";
import { getPushKeys, modelRegister } from "@/util";

import { IDictionary } from "common-types";
import { getDbIndexes } from "@/decorators";

export function model(options: Partial<IFmModelMeta> = {}) {
  let isDirty: boolean = false;

  return function decorateModel<T extends IModel>(
    target: FmModelConstructor<T>
  ) {
    // Function to add META to the model
    function addMetaProperty() {
      const modelOfObject = new target();

      if (options.audit === undefined) {
        options.audit = false;
      }
      if (
        !(
          options.audit === true ||
          options.audit === false ||
          options.audit === "server"
        )
      ) {
        console.log(
          `You set the audit property to "${options.audit}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`
        );
        options.audit = false;
      }

      const meta: IFmModelMeta = {
        ...options,
        ...{ isProperty: isProperty(modelOfObject) },
        ...{ property: getModelProperty(modelOfObject) },
        ...{ properties: getProperties(modelOfObject) },
        ...{ isRelationship: isRelationship(modelOfObject) },
        ...{ relationship: getModelRelationship(modelOfObject) },
        ...{ relationships: getRelationships(modelOfObject) },
        ...{ dbIndexes: getDbIndexes(modelOfObject) },
        ...{ pushKeys: getPushKeys(modelOfObject) },
        ...{ dbOffset: options.dbOffset ? options.dbOffset : "" },
        ...{ audit: options.audit ? options.audit : false },
        ...{ plural: options.plural },
        ...{
          allProperties: [
            ...getProperties(modelOfObject).map((p) => p.property),
            ...getRelationships(modelOfObject).map((p) => p.property),
          ],
        },
        ...{
          localPostfix:
            options.localPostfix === undefined ? "all" : options.localPostfix,
        },
        ...{
          localModelName:
            options.localModelName === undefined
              ? modelOfObject.constructor.name.slice(0, 1).toLowerCase() +
                modelOfObject.constructor.name.slice(1)
              : options.localModelName,
        },
        ...{ isDirty },
      };

      addModelMeta(target.constructor.name.toLowerCase(), meta);

      Object.defineProperty(target.prototype, "META", {
        get(): IFmModelMeta {
          return meta;
        },
        set(prop: IDictionary) {
          if (typeof prop === "object" && prop.isDirty !== undefined) {
            isDirty = prop.isDirty;
          } else {
            throw new Error(
              "The META properties should only be set with the @model decorator at design time!"
            );
          }
        },
        configurable: false,
        enumerable: false,
      });

      if (target) {
        // register the constructor so name based lookups will succeed
        modelRegister(target);
      }

      return target;
    }

    // copy prototype so intanceof operator still works
    addMetaProperty.prototype = target.prototype;

    // return new constructor (will override original)
    return addMetaProperty();
  };
}
