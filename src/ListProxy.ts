import { Record } from "./record";
import { IDictionary } from "common-types";
import { ISchemaMetaProperties } from "./decorators/schema";
import { Model } from "./Model";

function construct<T>(target: ListProxy<T>, ...args: any[]): any {
  //
}

type ListGetInceptor<T> = (
  target: T,
  prop: PropertyKey,
  value?: any,
  receiver?: any
) => void;

export class ListProxy<T> extends Array<T> {
  public static create<T extends Model>(modelConstructor: new () => T, items?: T[]) {
    const record = Record.create(modelConstructor);
    const get: ListGetInceptor<T> = (target, prop, value, receiver) => {
      //
    };
    // const arr = new Proxy<ListProxy<T>>(new ListProxy<T>(items), {});
    const arr = new ListProxy<T>(items);
    arr.__record__ = record;
    return arr;
  }
  public __record__: Record<T>;

  private constructor(items?: T[]) {
    super(...items);
  }

  public get modelName() {
    return this.__record__ ? (this.__record__ as Record<T>).modelName : "unknown";
  }
  public get pluralName() {
    return this.__record__ ? (this.__record__ as Record<T>).pluralName : "unknown";
  }
  public get pushKeys() {
    return this.__record__ ? (this.__record__ as Record<T>).META.pushKeys : {};
  }
  public get properties() {
    return this.__record__ ? (this.__record__ as Record<T>).META.properties : [];
  }
  public get relationships() {
    return this.__record__ ? (this.__record__ as Record<T>).META.relationships : [];
  }
  public get dbOffset() {
    return this.__record__
      ? (this.__record__ as Record<T>).META.dbOffset
      : "not applicable";
  }
  public get isAudited() {
    return this.__record__
      ? (this.__record__ as Record<T>).META.audit
        ? true
        : false
      : false;
  }
  public property(prop: keyof T): ISchemaMetaProperties | null {
    if (!this.__record__) {
      const e = new Error(`You can't check for meta properties of a non-Model!`);
      e.name = "FireModel::Forbidden";
      throw e;
    }
    return (this.__record__ as Record<T>).META.property(prop);
  }
}
