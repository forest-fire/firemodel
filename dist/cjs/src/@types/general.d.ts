import { Model } from "../Model";
import { IDictionary, datetime } from "common-types";
export declare type FmModelConstructor<T extends Model> = new () => T;
export interface IModelOptions {
    logger?: ILogger;
    db?: import("abstracted-firebase").RealTimeDB;
}
export interface IMetaData {
    attributes: IDictionary;
    relationships: IDictionary<IRelationship>;
}
export interface IAuditFilter {
    /** audit entries since a given unix epoch timestamp */
    since?: number;
    /** the last X number of audit entries */
    last?: number;
}
export declare type IComparisonOperator = "=" | ">" | "<";
export declare type IConditionAndValue = [IComparisonOperator, boolean | string | number];
export declare type FirebaseCrudOperations = "push" | "set" | "update" | "remove";
export interface IAuditRecord {
    crud: FirebaseCrudOperations;
    when: datetime;
    schema: string;
    key: string;
    info: IDictionary;
}
export interface ILogger {
    log: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
    error: (message: string) => void;
}
export interface IRelationship {
    cardinality: string;
    policy: RelationshipPolicy;
}
export declare enum RelationshipPolicy {
    keys = "keys",
    lazy = "lazy",
    inline = "inline"
}
export declare enum RelationshipCardinality {
    hasMany = "hasMany",
    belongsTo = "belongsTo"
}
