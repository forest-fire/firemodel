import "reflect-metadata";
import { IDictionary, ClassDecorator } from "common-types";
import { getPushKeys } from "./decorator";
import { addModelMeta } from "../ModelMeta";
import { getDbIndexes } from "./indexing";
import { getModelProperty, getProperties } from "./model-meta/property-store";
import {
  getModelRelationship,
  isRelationship,
  getRelationships
} from "./model-meta/relationship-store";
import { IFmModelMeta } from "./types";
/* tslint:disable:only-arrow-functions */

function isProperty(modelKlass: IDictionary) {
  return (prop: string) => {
    const modelProps = getModelProperty(modelKlass)(prop);
    return modelProps ? true : false;
  };
}

export function model(options: Partial<IFmModelMeta> = {}): ClassDecorator {
  let isDirty: boolean = false;
  return (target: any): void => {
    // Function to add META
    const f: any = function() {
      const modelObjectWithMetaProperty = target;
      const modelOfObject = new modelObjectWithMetaProperty();

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
          `You set the audit property to "${
            options.audit
          }" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`
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
          localPostfix:
            options.localPostfix === undefined ? "all" : options.localPostfix
        },
        ...{ isDirty }
      };

      addModelMeta(
        modelObjectWithMetaProperty.constructor.name.toLowerCase(),
        meta
      );

      Object.defineProperty(modelObjectWithMetaProperty.prototype, "META", {
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
        enumerable: false
      });
      return modelObjectWithMetaProperty;
    };

    // copy prototype so intanceof operator still works
    f.prototype = target.prototype;

    // return new constructor (will override original)
    return f();
  };
}
