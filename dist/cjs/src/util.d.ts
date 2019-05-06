import { IDictionary } from "common-types";
import { IAuditChange } from "./Audit";
import { Model } from "./Model";
export declare function normalized(...args: string[]): string[];
export declare function slashNotation(...args: string[]): string;
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
export declare function compareHashes<T extends IDictionary = IDictionary>(from: T, to: T): IComparisonResult;
export declare function getAllPropertiesFromClassStructure<T extends Model>(model: T): ("id" | "lastUpdated" | "createdAt" | "META")[];
