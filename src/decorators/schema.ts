import 'reflect-metadata';
import { IDictionary, ClassDecorator } from 'common-types';
/* tslint:disable:only-arrow-functions */

export interface ISchemaOptions {
  /** Optionally specify a root path to store this schema under */
  dbOffset?: string;
  /** Optionally specify a root path where the local store will put this schema under */
  localOffset?: string;
  property?: (prop: string) => IDictionary;
  audit?: boolean;
  /** A list of all properties along with associated meta-data for the given schema */
  properties?: ISchemaMetaProperties[];
  /** A list of all relationships along with associated meta-data for the given schema */
  relationships?: ISchemaMetaProperties[];
}

export interface ISchemaMetaProperties {
  type: string;
  length?: number;
  min?: number;
  max?: number;
  inverse?: string;
  isRelationship?: boolean;
  isProperty?: boolean;
  [key: string]: any;
}

/** lookup meta data for schema properties */
function propertyMeta(context: object) {
  return (prop: string): ISchemaMetaProperties => Reflect.getMetadata(prop, context);
}

function propertyList(context: object): ISchemaMetaProperties[] {
  return Object.keys(context)
    .filter(p => propertyMeta(context)(p).isProperty)
    .map(p => propertyMeta(context)(p));
}

function relationshipList(context: object): ISchemaMetaProperties[] {
  console.log(Reflect.getOwnMetadataKeys(context));
  console.log(Reflect.getOwnPropertyDescriptor(context, 'fatherId'));

  return Reflect.getOwnMetadataKeys(context)
  .filter(p => propertyMeta(context)(p).isRelationship)
  .map(p => propertyMeta(context)(p));
}

export function schema(options: ISchemaOptions): ClassDecorator {
  return (target: any): void => {
    const original = target;

    // new constructor
    const f: any = function(...args: any[]) {
      const meta = options;
      const obj = Reflect.construct(original, args);
      Reflect.defineProperty(obj, 'META', {
        get(): ISchemaOptions {
          return {
            ...options,
            ...{ property: propertyMeta(obj) },
            ...{ properties: propertyList(obj) },
            ...{ relationships: relationshipList(obj) },
            ...{ audit: options.audit ? options.audit : false }
          };
        },
        set() {
          throw new Error('The meta property can only be set with the @schema decorator!')
        },
        configurable: false,
        enumerable: false
      });
      return obj;
    }

    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;

    // return new constructor (will override original)
    return f;
  }
}
