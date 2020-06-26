import { IDictionary, datetime } from "common-types";

// import { IAbstractedDatabase } from "universal-fire";
import { IAbstractedDatabase } from "universal-fire";
import { Model } from "@/core";

export type FmModelConstructor<T extends Model> = new () => T;

/** _options_ allowed to modify the behavior/configuration of a `Model` */
export interface IModelOptions {
  logger?: ILogger;
  db?: IAbstractedDatabase;
}

/**
 * **List Options**
 *
 * provides a means to configure the list, options include:
 *
 * - `logger`: add in a logger function instead of default
 * - `offsets`: for dynamic paths, specify the dynamic properties needed
 * - `db`: allows you to specify a non-default Firebase DB
 */
export interface IListOptions<T> extends IModelOptions {
  offsets?: Partial<T>;
  db?: IAbstractedDatabase;
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
export type IConditionAndValue = [
  IComparisonOperator,
  boolean | string | number
];
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
  inline = "inline",
}
export enum RelationshipCardinality {
  hasMany = "hasMany",
  belongsTo = "belongsTo",
}

/**
 * a gathering of name/value pairs which are to be changed
 * in the database but which have a root path which define
 * their fully qualified path.
 *
 * Often used to feed into a MPS object.
 */
export interface IFmDatabasePaths {
  /** a dictionary of name/values where the "name" is relative path off the root */
  paths: IFmPathValuePair[];
  /** the fully qualified paths in the DB which will be effected */
  fullPathNames: string[];
  /** the root path which all paths originate from */
  root: string;
}

export interface IFmPathValuePair {
  /** the path in the DB */
  path: string;
  /** the value at the given path */
  value: any;
}

export interface IFmHasId {
  id: string;
}

/**
 * Get the type of an Object's property
 */
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
