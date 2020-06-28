import { IFmModelMeta } from "@/types";
import { epochWithMilliseconds } from "common-types";

/**
 * Provides the structure -- without implementation -- of the base `Model` class
 * which Firemodel extends for all user defined models
 */
export interface IModel {
  id?: string;
  lastUpdated?: epochWithMilliseconds;
  createdAt?: epochWithMilliseconds;
  META?: IFmModelMeta;
}
