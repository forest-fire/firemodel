import "reflect-metadata";
import { IDictionary, ClassDecorator } from "common-types";
export declare type ISchemaRelationshipType = "hasMany" | "ownedBy";
export interface ISchemaOptions<T = any> {
    /** Optionally specify a root path to store this schema under */
    dbOffset?: string;
    /** Optionally specify a root path where the local store will put this schema under */
    localOffset?: string;
    property?: (prop: keyof T) => ISchemaMetaProperties;
    audit?: boolean;
    /** A list of all properties along with associated meta-data for the given schema */
    properties?: ISchemaMetaProperties[];
    /** A list of all relationships along with associated meta-data for the given schema */
    relationships?: ISchemaRelationshipMetaProperties[];
    /** A list of properties which should be pushed using  */
    pushKeys?: string[];
}
export interface ISchemaRelationshipMetaProperties extends ISchemaMetaProperties {
    isRelationship: true;
    isProperty: false;
    relType: ISchemaRelationshipType;
}
export interface ISchemaMetaProperties extends IDictionary {
    type: string;
    length?: number;
    min?: number;
    max?: number;
    inverse?: string;
    /** is this prop a FK relationship to another entity/entities */
    isRelationship: boolean;
    /** is this prop an attribute of the schema (versus being a relationship) */
    isProperty?: boolean;
    pushKey?: boolean;
    /** what kind of relationship does this foreign key contain */
    relType?: ISchemaRelationshipType;
}
export declare function model(options: ISchemaOptions): ClassDecorator;
