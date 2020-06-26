import { IAuditChange, IFmChangedProperties } from "./@types/index";
import { IDictionary } from "common-types";
import { Model } from "./private";
export declare function normalized(...args: string[]): string[];
export declare function slashNotation(...args: string[]): string;
export declare function firstKey<T extends IDictionary = IDictionary>(thingy: T): string;
export declare function dotNotation(...args: string[]): string;
export interface IExtendedError extends Error {
    underlying: any;
    code: string;
    details: any[];
}
export declare function updateToAuditChanges<T = any>(changed: IDictionary, prior: IDictionary): IAuditChange[];
export interface IComparisonResult {
    added: string[];
    changed: string[];
    removed: string[];
}
export declare function compareHashes<T extends Model>(from: Partial<T>, to: Partial<T>, 
/**
 * optionally explicitly state properties so that relationships
 * can be filtered away
 */
modelProps?: Array<keyof T & string>): IFmChangedProperties<T>;
export declare function getAllPropertiesFromClassStructure<T extends Model>(model: T): ("id" | "lastUpdated" | "createdAt" | "META")[];
export declare function withoutMetaOrPrivate<T extends Model>(model: T): T;
export declare function capitalize(str: string): string;
export declare function lowercase(str: string): string;
export declare function stripLeadingSlash(str: string): string;
