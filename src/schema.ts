import 'reflect-metadata';
import { IDictionary, ClassDecorator } from 'common-types';
/* tslint:disable:only-arrow-functions */

export interface ISchemaOptions {
  /** Optionally specify a root path to store this schema under */
  dbOffset?: string;
  /** Optionally specify a root path where the local store will put this schema under */
  storeOffset?: string;
}

export function schema(options: ISchemaOptions): ClassDecorator {
  return (target: any): void => {
    console.log('schema options:', options, ' for ', target.name);
    const original = target;

    // new constructor
    const f: any = function(...args: any[]) {
      const meta = options;
      const obj = Reflect.construct(original, args);
      Reflect.defineProperty(obj, 'META', {
        get() {
          return options;
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
