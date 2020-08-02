import { IDictionary, epoch, fk, pk } from "common-types";
import {
  IFmHasId,
  IFmModelMeta,
  IFmModelPropertyMeta,
  IFmModelRelationshipMeta,
} from "@/types";
import { IReduxAction, IReduxDispatch } from "./state-mgmt";

import { IAbstractedDatabase } from "universal-fire";
import { IFmFunctionToConstructor } from "./decorator-types";
import { IModel } from "./model-types";

/**
 * A simplified interface that represents a `Record`'s shape
 * in reasonable fidelity so that functions that only need this
 * fidelity can use this internally.
 */
export interface IRecord<T extends IModel = IModel> {
  META: IFmModelMeta;
  localPath: string;
  localPrefix: string;
  dbPath: string;
  dbOffset: string;
  modelName: string;
  pluralName: string;
  properties: IFmModelPropertyMeta[];
  relationships: IFmModelRelationshipMeta[];
  dispatch: IReduxDispatch<IReduxAction, any>;
  db: IAbstractedDatabase;
  pushKeys: string[];
  data: T;
  hasDynamicPath: boolean;
  dynamicPathComponents: string[];
  compositeKey: ICompositeKey<T>;
  compositeKeyRef: string;
  id: string;
  /**
   * Gets all relevant meta-data for a given record's relationship
   * property. This includes validation checks that the PK and FK's
   * models are aligned in their relationship definitions.
   */
  getMetaForRelationship: (
    property: string & keyof T
  ) => IRecordRelationshipMeta;
}

export interface IRecordRelationshipMeta {
  /** a function which returns the FK's constructor */
  fkConstructor: IFmFunctionToConstructor;
  /** the relationship's model name */
  modelName: string;
  /** the plural variant of the relationship's model name */
  pluralName: string;
  /**
   * If the PK model states that an inverse property _should exist_
   * on the FK then the FK model will be checked to ensure that it
   * in turn has a relationship property pointing back to the PK.
   *
   * This boolean flag evaluates to `true` when the PK has indicated
   * and inverse property on the FK and the FK does NOT have this
   * property.
   */
  inverseIsMissing: boolean;
  /**
   * If the PK model states an inverse property _should exist_ and
   * the FK model _does_ have the inverse property but the inverse
   * property points to a model that is NOT the PK model this will
   * evaluate to `true`.
   */
  inversePointsToWrongModel: boolean;
  /**
   * In cases where there is a two-way relationship, the PK model can sometimes
   * correctly point to an inverse property on the FK model _but_ the FK model's
   * definition has an inverse which _does not_ point back to the PK's property
   * name.
   *
   * In cases where the PK _does not_ have a inverse property for the relationship
   * this will always be `false`.
   */
  fkHasInvalidInverse: boolean;
  /**
   * The property on the FK which is expected to point back to the PK
   */
  fkInverseProperty?: string;
  /**
   * The inverse property on the FK's property which _should_ point back to
   * the PK's relationship property that was passed in.
   */
  fkReciprocalInverseProperty?: string;

  /**
   * Indicates the cardinality of the relationship (e.g., `1:1`, `1:M`, `M:M`)
   */
  cardinality: string;
}

export type IIdWithDynamicPrefix = IDictionary<number | string> & {
  id: string;
};

export type ICompositeKeyGeneric = IDictionary<string | number | boolean>;

export type ICompositeKey<T = ICompositeKeyGeneric> = IFmHasId & Partial<T>;
/**
 * A Foreign Key (FK) reference where both object and string notation of simple
 * or composite keys is valid.
 */
export type IFkReference<T = ICompositeKeyGeneric> = fk | ICompositeKey<T>;
export type IPrimaryKey<T> = pk | ICompositeKey<T>;

export interface IFmBuildRelationshipOptions {
  /**
   * optionally send in a epoch timestamp; alternative it will be created
   * automatically. The ability to send a value allows for hasMany operations which
   * are more than a single PK:FK grouped as a transaction
   */
  now?: epoch;
  /**
   * the "other value" pairing for a _hasMany_ relationship; defaults to `true`
   */
  altHasManyValue?: true | any;
  /**
   * By default it is assumed the action for paths is to build relationships but
   * if the operation is asking for the removal of relationships this should be
   * set to "remove"
   */
  operation?: "remove" | "add";

  /**
   * Optionally pass in an explicit database connection
   */
  db?: IAbstractedDatabase;
}

export interface IRecordOptions {
  db?: IAbstractedDatabase;
  logging?: any;
  id?: string;
  /** if you're working off of a mocking database, there are situations where adding a record silently (aka., not triggering any listener events) is desirable and should be allowed */
  silent?: boolean;
  /**
   * Allows that when setting FK relationships you can set the actual record data instead
   * of just a FK reference. Useful for setting up test data and _may_ be useful elsewhere
   * but be careful if you think other use cases makes sense. In most cases they DO NOT
   * and you should instead be using the given _relationship_ API exposed by `Record`
   *
   * Note: the correct structure for a `deepRelationships` setter
   * in a _hasMany_ relationship would be:
 ```ts
 {
  oneToManyPropName: {
      id1: { ... },
      id2: { ... },
      shallowFk: true,
      etc: { ... }
  }
 }
```
   * It is ok to combine FK references and deep objects so long as the
   * _shallow_ FK references are set to `true`. Also note that the deep set
   * is available to `belongsTo` relationships too but figured on docs
   * would focus on the more complicated example.
   */
  setDeepRelationships?: boolean;

  /**
   * By default, whether the `localPath` meta property is determined
   * by whether you have a **Record** or **List** watcher but this will
   * not always work.
   *
   * In order to accomodate this you can state explicitly whether the
   * local path should be pluralized.
   */
  pluralizeLocalPath?: boolean;
}

export interface IWriteOperation {
  id: string;
  type: "set" | "pushKey" | "update";
  /** The database path being written to */
  path: string;
  /** The new value being written to database */
  value: any;
  /** called on positive confirmation received from server */
  callback: (type: string, value: any) => void;
}

export interface IMultiPathUpdates {
  path: string;
  value: any;
}
