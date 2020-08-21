import { IDictionary, datetime } from "common-types";

// import { IAbstractedDatabase } from "universal-fire";
import { IAbstractedDatabase } from "universal-fire";
import { IModel, IPrimaryKey } from "@/types";
import type { FireModelError } from "@/errors";

export interface IUnderlyingError<T> {
  /** an identifying characteristic of the individual error */
  id: string | IPrimaryKey<T>;
  /** the error itself */
  error: FireModelError;
}

/** A property of a record */
export type PropertyOf<T> = keyof T & string;

export type FmModelConstructor<T extends IModel> = new () => T;

/** _options_ allowed to modify the behavior/configuration of a `Model` */
export interface IModelOptions {
  logger?: ILogger;
  db?: IAbstractedDatabase;
}

export enum SortOrder {
  /** Sort in Ascending order */
  ASC = "ASC",
  /** Sort in Decending order */
  DEC = "DEC",
}

/**
 * **IWatchOptions**
 *
 * provides options to configure `Watch` triggered listeners
 * on Firebase databases.
 */
export interface IWatchOptions<T> extends Omit<IListOptions<T>, "paginate"> {
  /**
   * Filters the results returned by the watched query prior to _dispatch_
   * which allows a way to only send a subset of records to the state management
   * tool of choice.
   *
   * ```ts
   * const r1 = await Watch.since(
   *    MyMusic,
   *    new Date().getTime(),
   *    { filter: m => m.genre === 'rap' }
   *);
   * ```
   *
   * In this example, the watcher will return _all_ changes it detects on `MyMusic`
   * in Firebase. However, with the filter, only music categorized as "rap" will be
   * dispatched.
   */
  filter?: (rec: T) => boolean;
}

/**
 * **IListOptions**
 *
 * provides options to configure `List` based queries
 */
export interface IListOptions<T, K extends keyof T = keyof T>
  extends IModelOptions {
  offsets?: Partial<T>;
  /**
   * optionally use an _explicit_ database connection rather than the
   * _default_ connection located at `FireModel.defaultDb`.
   */
  db?: IAbstractedDatabase;

  /**
   * Specifies which property in the Model should be used to order the query
   * results on the server.
   *
   * If using the **RTDB**, you will typically want to make sure that
   * properties which you order by are marked with a `@index` in
   * the Model definition to ensure performant results.
   *
   * When using **Firestore**, everything is automaticaly indexed so
   * it's not as critical but is still considered a good practice
   * because it shows intent in your model but also because if you use caching
   * layers like **IndexedDB** you will need to explicit articulation
   * of indexes anyway.
   */
  orderBy?: K & string;
  /**
   * **limitToFirst**
   *
   * When the server has run the query this allows a descrete limit of
   * records to be returned to the client. This reduces network traffic
   * and also your Firebase bill (_since that's related to how much you
   * send over the wire_ from Firebase).
   *
   * > Note: The "first" records are determined by the query's `orderBy`
   * property
   */
  limitToFirst?: number;
  /**
   * **limitToFirst**
   *
   * When the server has run the query this allows a descrete limit of
   * records to be returned to the client. This reduces network traffic
   * and also your Firebase bill (_since that's related to how much you
   * send over the wire_ from Firebase).
   *
   * > Note: The "last" records are determined by the query's `orderBy`
   * property
   */
  limitToLast?: number;

  /**
   * **startAt**
   *
   * Once the results of a query have been calculated by Firebase, you can use
   * the parameter to _start at_ a record after the first record in the array.
   *
   * > **Note:** in pagination scenarios you may consider using the the `List.paginate(x)`
   * > API instead of building your own.
   */
  startAt?: number;

  /**
   * **endAt**
   *
   * Once the results of a query have been calculated by Firebase, you can use
   * the parameter to _end at_ a record after the first record in the array.
   *
   * > **Note:** in pagination scenarios you may consider using the the `List.paginate(x)`
   * > API instead of building your own.
   */
  endAt?: number;

  /**
   * Turn on pagination by stating the page _size_ in the options hash
   */
  paginate?: number;
}

export type IListQueryOptions<T> = Omit<
  IListOptions<T>,
  "orderBy" | "limitToFirst" | "limitToLast" | "startAt" | "endAt"
>;

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
