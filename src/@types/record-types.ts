import { IDictionary, fk, pk, epoch } from "common-types";
import { IFmHasId } from "./general";
import { Model } from "../Model";

export type IIdWithDynamicPrefix = IDictionary<number | string> & {
  id: string;
};

export type ICompositeKeyGeneric = IDictionary<string | number | boolean>;

export type ICompositeKey<T = ICompositeKeyGeneric> = IFmHasId & T;
export type IFkReference = fk | ICompositeKey;
export type IPrimaryKey = pk | ICompositeKey;

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
