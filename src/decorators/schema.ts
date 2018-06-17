import "reflect-metadata";
import {
  IDictionary,
  ClassDecorator,
  IStepFunctionBaseLogicalOperand
} from "common-types";
import { getRelationships, getProperties, getPushKeys } from "./decorator";
import { Model } from "../Model";
/* tslint:disable:only-arrow-functions */

export type ISchemaRelationshipType = "hasMany" | "ownedBy";

export interface IModelMetaProperties<T extends Model = any> {
  /** Optionally specify a root path to store this schema under */
  dbOffset?: string;
  /** Optionally specify a root path where the local store will put this schema */
  localOffset?: string;
  property?: (prop: keyof T) => ISchemaMetaProperties<T>;
  audit?: boolean;
  /** A list of all properties and associated meta-data for the given schema */
  properties?: Array<ISchemaMetaProperties<T>>;
  /** A list of all relationships and associated meta-data for the given schema */
  relationships?: Array<ISchemaRelationshipMetaProperties<T>>;
  /** A list of properties which should be pushed using firebase push() */
  pushKeys?: string[];
  /** indicates whether this property has been changed on client but not yet accepted by server */
  isDirty?: boolean;
}

export interface ISchemaRelationshipMetaProperties<T extends Model = Model>
  extends ISchemaMetaProperties<T> {
  isRelationship: true;
  isProperty: false;
  /** the general cardinality type of the relationship (aka, hasMany, ownedBy) */
  relType: ISchemaRelationshipType;
  /** The constructor for a model of the FK reference that this relationship maintains */
  fkConstructor: new () => T;
}
export interface ISchemaMetaProperties<T extends Model = Model>
  extends IDictionary {
  /** the property name */
  property: Extract<keyof T, string>;
  /** the type of the property */
  type: string;
  /** constraint: a maximum length */
  length?: number;
  /** constraint: a minimum value */
  min?: number;
  /** constraint: a maximum value */
  max?: number;
  /** the name -- if it exists -- of the property on the FK which points back to this record */
  inverse?: string;
  /** is this prop a FK relationship to another entity/entities */
  isRelationship: boolean;
  /** is this prop an attribute of the schema (versus being a relationship) */
  isProperty?: boolean;
  /** is this property an array which is added to using firebase pushkeys? */
  pushKey?: boolean;
  /** what kind of relationship does this foreign key contain */
  relType?: ISchemaRelationshipType;
  /** if the property is a relationship ... a constructor for the FK's Model */
  fkConstructor?: new () => any;
  fkModelName: string;
}

/** lookup meta data for schema properties */
function propertyMeta<T extends Model = Model>(context: object) {
  return (prop: string): ISchemaMetaProperties<T> =>
    Reflect.getMetadata(prop, context);
}

export function model(options: IModelMetaProperties): ClassDecorator {
  let isDirty: boolean = false;
  return (target: any): void => {
    const original = target;

    // new constructor
    const f: any = function(...args: any[]) {
      const meta = options;
      const obj = Reflect.construct(original, args);

      Reflect.defineProperty(obj, "META", {
        get(): IModelMetaProperties {
          return {
            ...options,
            ...{ property: propertyMeta(obj) },
            ...{ properties: getProperties(obj) },
            ...{ relationships: getRelationships(obj) },
            ...{ pushKeys: getPushKeys(obj) },
            ...{ audit: options.audit ? options.audit : false },
            ...{ isDirty }
          };
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
      return obj;
    };

    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;

    // return new constructor (will override original)
    return f;
  };
}
