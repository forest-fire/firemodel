// tslint:disable:no-unused-expression
export type NonProperties<T> = {
  [P in keyof T]: T[P] extends () => any ? never : P
}[keyof T];
export type Properties<T> = Pick<T, NonProperties<T>>;
import { IDictionary, epochWithMilliseconds, datetime } from "common-types";
import { property } from "./decorators/property";
import { ISchemaOptions, ISchemaMetaProperties } from "./decorators/schema";

export interface IModelOptions {
  logger?: ILogger;
  db?: import("abstracted-firebase").RealTimeDB;
}
export interface IMetaData {
  attributes: IDictionary;
  relationships: IDictionary<IRelationship>;
}

export interface IAuditFilter {
  /** audit entries since a given unix epoch timestamp */
  since?: number;
  /** the last X number of audit entries */
  last?: number;
}

export type IComparisonOperator = "=" | ">" | "<";
export type IConditionAndValue = [IComparisonOperator, boolean | string | number];
export type FirebaseCrudOperations = "push" | "set" | "update" | "remove";

export interface IAuditRecord {
  crud: FirebaseCrudOperations;
  when: datetime;
  schema: string;
  key: string;
  info: IDictionary;
}

export interface ILogger {
  log: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string) => void;
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

export abstract class Model {
  /** The primary-key for the record */
  @property public id?: string;
  /** The last time that a given record was updated */
  @property public lastUpdated?: epochWithMilliseconds;
  /** The datetime at which this record was first created */
  @property public createdAt?: epochWithMilliseconds;
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
