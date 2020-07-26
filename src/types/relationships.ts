import { FireModelError } from "@/errors";
import { IDictionary } from "common-types";
import { IAbstractedDatabase } from "universal-fire";

/**
 * **IFmRelationshipOperation**
 *
 * The operations that all transactional _relationship_ operations must fit into
 */
export type IFmRelationshipOperation =
  /** a hasOne relationship that is being set (where value was empty prior) */
  | "set"
  /** when a SET takes place on a hasOne which was already set */
  // | "update"
  /** clears/removes all FK's on a given relationship */
  | "clear"
  /** a hasMany relationship which has had a new FK added */
  | "add"
  /** can be either a hasOne or hasMany relationship where props have been removed */
  | "remove";
/**
 * **IFmRelationshipOptions**
 *
 * The options that each of the `Record` relationship API endpoints provides
 * as an optional parameter
 */
export interface IFmRelationshipOptions {
  /**
   * Ensure that FK being referenced actually exists; throw error if not.
   * Default is false.
   */
  validateFk?: boolean;
  /**
   * Allows the given operation to be executed against the database but to
   * NOT send the events to the `dispatch()` function. Default is false.
   * In general this should be avoided except for Mock's and in testing
   * functions but possibly there are other use cases.
   */
  silent?: boolean;
  /**
   * By default if you set a relationship and that relationship _already_ existed
   * then it will be ignored with the assumption that this an affirmation of an
   * existing relationship. If instead you want this represent an error you can
   * set this to `true` and it will throw the `firemodel/duplicate-relationship`
   * error.
   *
   * If this remains in the default state of `false` and FireModel can detect this
   * state without doing any additional DB queries it will fire a
   * `RELATIONSHIP_DUPLICATE_ADD` dispatch event. This shouldn't be relied on but
   * can sometimes proactively alert developers in development of unintended
   * behavior.
   */
  duplicationIsError?: boolean;
  /**
   * If there is any needed steps to rollback the operation a callback can be added
   * to ensure the rollback is complete.
   */
  rollback?: (e: FireModelError) => Promise<void>;

  /**
   * Provide an explicit reference to the database for the relationship operations
   */
  db?: IAbstractedDatabase;
}

/**
 * The options that each of the `hasMany` transactional API endpoints must expose
 */
export interface IFmRelationshipOptionsForHasMany
  extends IFmRelationshipOptions {
  /**
   * the default behaviour is to add the value `true` but you can optionally
   * add some additional piece of information here instead.
   *
   * Note that Firebase does impose a small performance penality of you _do_ set
   * this to something else but the value of NOT having to lookup the relationship
   * in the DB might be valuable sometimes.
   */
  altHasManyValue?: any;
}

/**
 * Represents an array of _foreign-keys_ (1:M relations) as they would be represented
 * in a Firebase dataabase (aka, a dictionary where the key is the foreign key, the
 * value would _typically_ be "true" but could be something else in edge cases)
 */
export type fks<T = true> = IDictionary<T>;
