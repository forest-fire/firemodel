import { ISerializedQuery } from "universal-fire";
import { ISdk } from "@forest-fire/types";

/**
 * **IFmQueryDefn**
 *
 * A mechanism of allowing consumers to build a
 * `SerializedQuery` at run time for the database type that
 * they have chosen at run time.
 *
 * Users of this interface are guarenteed of getting a
 * valid `SerializedQuery` class which has been initialized
 * to point to the correct database path.
 *
 * Users can optionally pick up the `offset` and `pageSize`
 * properties of pagination. If pagination has not been
 * configured, these two props will be `undefined`.
 */
export interface IFmQueryDefn<T> {
  (
    q: ISerializedQuery<ISdk, T>,
    offset?: number,
    pageSize?: number
  ): ISerializedQuery<ISdk, T>;
}
