// tslint:disable:no-unused-expression
export type NonProperties<T> = {
  [// tslint:disable-next-line:ban-types
  P in keyof T]: T[P] extends Function ? never : P
}[keyof T];
export type Properties<T> = Pick<T, NonProperties<T>>;
import { IDictionary, datetime, epoch } from "common-types";
import set = require("lodash.set");
import { property } from "./decorators/property";
import { ISchemaOptions, ISchemaMetaProperties } from "./decorators/schema";

export interface IMetaData {
  attributes: IDictionary;
  relationships: IDictionary<IRelationship>;
}

export interface IRelationship {
  cardinality: string;
  policy: RelationshipPolicy;
}
export enum RelationshipPolicy {
  keys = "keys",
  lazy = "lazy",
  inline = "inline"
}
export enum RelationshipCardinality {
  hasMany = "hasMany",
  belongsTo = "belongsTo"
}

export abstract class BaseSchema {
  /** The primary-key for the record */
  @property public id?: string;
  /** The last time that a given record was updated */
  @property public lastUpdated?: epoch;
  /** The datetime at which this record was first created */
  @property public createdAt?: epoch;
  /** Metadata properties of the given schema */
  public META?: Partial<ISchemaOptions>;

  public toString() {
    const obj: IDictionary = {};
    this.META.properties.map(p => {
      obj[p.property] = (this as any)[p.property];
    });
    return JSON.stringify(obj);
  }
}
