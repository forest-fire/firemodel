import "reflect-metadata";
import { IDictionary } from "common-types";
import { IModelIndexMeta } from "@/private";
/** DB Indexes accumlated by index decorators */
export declare const indexesForModel: IDictionary<IDictionary<IModelIndexMeta>>;
/**
 * Gets all the db indexes for a given model
 */
export declare function getDbIndexes<T>(modelKlass: object): IModelIndexMeta[];
export declare const index: (modelKlass: import("..").Model, key: string) => void;
export declare const uniqueIndex: (modelKlass: import("..").Model, key: string) => void;
