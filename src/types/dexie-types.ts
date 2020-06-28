import type { Dexie, Transaction } from "dexie";

import { IDictionary } from "common-types";
import { IFmModelMeta } from "@/types";

export interface IDexiePriorVersion {
  /**
   * The model definitions for the prior version
   */
  models: IDictionary<string>;
  /** If there is a schema change then  */
  upgrade?: (collection: Transaction) => Dexie.Collection<any, any>;
}

/**
 * incorporates all the standard META properties but adds a
 * few more that are derived from getters of a `Record`.
 */
export interface IDexieModelMeta extends IFmModelMeta {
  modelName: string;
  pluralName: string;
  hasDynamicPath: boolean;
  dynamicPathComponents: string[];
}

export interface IDexieListOptions<T> {
  orderBy?: keyof T & string;
  limit?: number;
  offset?: number;
}
