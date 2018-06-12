import "reflect-metadata";
import { IDictionary, ClassDecorator } from "common-types";
import { getRelationships, getProperties, getPushKeys } from "./decorator";
/* tslint:disable:only-arrow-functions */

export type ISchemaRelationshipType = "hasMany" | "ownedBy";

export interface ISchemaOptions<T = any> {
  /** Optionally specify a root path to store this schema under */
  dbOffset?: string;
  /** Optionally specify a root path where the local store will put this schema under */
  localOffset?: string;
  property?: (prop: keyof T) => ISchemaMetaProperties;
  audit?: boolean;
  /** A list of all properties along with associated meta-data for the given schema */
  properties?: ISchemaMetaProperties[];
  /** A list of all relationships along with associated meta-data for the given schema */
  relationships?: ISchemaRelationshipMetaProperties[];
  /** A list of properties which should be pushed using  */
  pushKeys?: string[];
}

export interface ISchemaRelationshipMetaProperties extends ISchemaMetaProperties {
  isRelationship: true;
  isProperty: false;
  relType: ISchemaRelationshipType;
}
export interface ISchemaMetaProperties extends IDictionary {
  type: string;
  length?: number;
  min?: number;
  max?: number;
  inverse?: string;
  /** is this prop a FK relationship to another entity/entities */
  isRelationship: boolean;
  /** is this prop an attribute of the schema (versus being a relationship) */
  isProperty?: boolean;
  pushKey?: boolean;
  /** what kind of relationship does this foreign key contain */
  relType?: ISchemaRelationshipType;
}

/** lookup meta data for schema properties */
function propertyMeta(context: object) {
  return (prop: string): ISchemaMetaProperties => Reflect.getMetadata(prop, context);
}

export function model(options: ISchemaOptions): ClassDecorator {
  return (target: any): void => {
    const original = target;

    // new constructor
    const f: any = function(...args: any[]) {
      const meta = options;
      const obj = Reflect.construct(original, args);

      Reflect.defineProperty(obj, "META", {
        get(): ISchemaOptions {
          return {
            ...options,
            ...{ property: propertyMeta(obj) },
            ...{ properties: getProperties(obj) },
            ...{ relationships: getRelationships(obj) },
            ...{ pushKeys: getPushKeys(obj) },
            ...{ audit: options.audit ? options.audit : false }
          };
        },
        set() {
          throw new Error("The meta property can only be set with the @model decorator!");
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
