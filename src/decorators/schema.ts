import "reflect-metadata";
import { IDictionary, ClassDecorator } from "common-types";
import {
  getRelationships,
  getPushKeys,
  relationshipsByModel
} from "./decorator";
import { Model } from "../Model";
import { addModelMeta } from "../ModelMeta";
import { IModelIndexMeta, getDbIndexes } from "./indexing";
import { FmMockType } from "./constraints";
import { getModelProperty, getProperties } from "./model/property-store";
/* tslint:disable:only-arrow-functions */

export type FmRelationshipType = "hasMany" | "hasOne";

export interface IFmModelMeta<T extends Model = any> {
  /** Optionally specify a root path to store this schema under */
  dbOffset?: string;
  /** Optionally specify an explicit string for the plural name */
  plural?: string;
  /** Optionally specify a root path where the local store will put this schema */
  localOffset?: string;
  /** Optionally specify a post-fix to the path where lists of records will be stored; by default this is set to "all" */
  localPostfix?: string;
  /** provides a boolean flag on whether the stated name is a property */
  isProperty?: (prop: keyof T) => boolean;
  /** a function to lookup the meta properties of a given property */
  property?: (prop: keyof T) => IFmModelPropertyMeta<T>;
  /** provides a boolean flag on whether the stated name is a property */
  isRelationship?: (prop: keyof T) => boolean;
  /** a function to lookup the meta properties of a given relationship */
  relationship?: (prop: keyof T) => IFmModelRelationshipMeta<T>;
  audit?: boolean | "server";
  /** A list of all properties and associated meta-data for the given schema */
  properties?: Array<IFmModelPropertyMeta<T>>;
  /** A list of all relationships and associated meta-data for the given schema */
  relationships?: Array<IFmModelRelationshipMeta<T>>;
  /** A list of properties which should be pushed using firebase push() */
  pushKeys?: string[];
  /** indicates whether this property has been changed on client but not yet accepted by server */
  isDirty?: boolean;
  /** get a list the list of database indexes on the given model */
  dbIndexes?: IModelIndexMeta[];
}

export interface IFmModelRelationshipMeta<T extends Model = Model>
  extends IFmModelAttributeBase<T> {
  isRelationship: true;
  isProperty: false;
  /** the general cardinality type of the relationship (aka, hasMany, hasOne) */
  relType: FmRelationshipType;
  /** the property name on the related model that points back to this relationship */
  inverseProperty?: string;
  /** The constructor for a model of the FK reference that this relationship maintains */
  fkConstructor: () => new () => T;
  /** the singular name of the relationship's model */
  fkModelName?: string;
  /** the plural name of the relationship's model */
  fkPluralName?: string;
  /** the name -- if it exists -- of the property on the FK which points back to this record */
  inverse?: string;
}
export interface IFmModelPropertyMeta<T extends Model = Model>
  extends IFmModelAttributeBase<T> {
  /** constraint: a maximum length */
  length?: number;
  /** the minimum length of the property */
  min?: number;
  /** the maximum length of the property */
  max?: number;
  /** is this prop a FK relationship to another entity/entities */
  isRelationship?: boolean;
  /** is this prop an attribute of the schema (versus being a relationship) */
  isProperty?: boolean;
  /** is this property an array which is added to using firebase pushkeys? */
  pushKey?: boolean;
}

export type FMPropertyType = "string" | "number" | "object" | "array";

export interface IFmModelAttributeBase<T> {
  /** the property name */
  property: Extract<keyof T, string>;
  /** the property's "typed value" */
  type: FMPropertyType;
  /** constraint: a maximum length */
  length?: number;
  /** constraint: a minimum value */
  min?: number;
  /** constraint: a maximum value */
  max?: number;
  /** is this prop a FK relationship to another entity/entities */
  isRelationship?: boolean;
  /** is this prop an attribute of the schema (versus being a relationship) */
  isProperty?: boolean;
  /** is this property an array which is added to using firebase pushkeys? */
  pushKey?: boolean;
  /**
   * a name or function of a type of data which can be mocked
   * in a more complete way than just it's stict "type". Examples
   * would include "telephone", "name", etc.
   */
  mockType?: FmMockType;
  /** a named mock can optionally recieve a set of parameters as additional input */
  mockParameters?: any[];
  /** what kind of relationship does this foreign key contain */
  relType?: FmRelationshipType;
  /** if the property is a relationship ... a constructor for the FK's Model */
  fkConstructor?: () => new () => any;
  fkModelName?: string;
}

function isProperty(modelKlass: IDictionary) {
  return (prop: string) => {
    const modelProps = getModelProperty(modelKlass)(prop);
    return modelProps ? true : false;
  };
}

function isRelationship(modelKlass: IDictionary) {
  return (prop: string) => {
    return getModelRelationship(modelKlass)(prop) ? true : false;
  };
}

function getModelRelationship<T extends Model = Model>(
  modelKlass: IDictionary<IFmModelRelationshipMeta<T>>
) {
  const className = modelKlass.constructor.name;
  if (relationshipsByModel[className]) {
    console.log(relationshipsByModel[className]);
  } else {
    console.log("missing: ", className);
  }

  return (prop: string) => (relationshipsByModel[className] || {})[prop];
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
