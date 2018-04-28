export declare type NonProperties<T> = {
    [P in keyof T]: T[P];
};
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
    inline = "inline",
}
export declare enum RelationshipCardinality {
    hasMany = "hasMany",
    belongsTo = "belongsTo",
}
export declare abstract class BaseSchema {
    id?: string;
    lastUpdated?: epoch;
    createdAt?: epoch;
    META?: Partial<ISchemaOptions>;
    toString(): string;
}
