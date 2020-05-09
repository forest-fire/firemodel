import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { IDictionary, fk, pk, epoch } from "common-types";

import { IFmHasId } from "./general";

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
}

export interface IRecordOptions {
  db?: AbstractedDatabase;
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
