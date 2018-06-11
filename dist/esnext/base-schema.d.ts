export declare type NonProperties<T> = {
    [P in keyof T]: T[P] extends () => any ? never : P;
}[keyof T];
export declare type Properties<T> = Pick<T, NonProperties<T>>;
import { IDictionary, epoch } from "common-types";
import { ISchemaOptions } from "./decorators/schema";
export interface IMetaData {
    attributes: IDictionary;
    relationships: IDictionary<IRelationship>;
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
export declare abstract class BaseSchema {
    /** The primary-key for the record */
    id?: string;
    /** The last time that a given record was updated */
    lastUpdated?: epoch;
    /** The datetime at which this record was first created */
    createdAt?: epoch;
    /** Metadata properties of the given schema */
    META?: Partial<ISchemaOptions>;
    toString(): string;
}
