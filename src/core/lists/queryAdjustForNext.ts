import { ISerializedQuery } from "universal-fire/dist/types/proxy-symbols";
import {  ISdk } from "@forest-fire/types"

/**
 * Adjusts the query so that the next "page" will be loaded
 */
export function queryAdjustForNext(q: ISerializedQuery<ISdk, any>, currentPage: number) {
  // TODO: finish
  return q;
}
