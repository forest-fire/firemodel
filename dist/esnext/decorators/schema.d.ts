import "reflect-metadata";
import { IDictionary, ClassDecorator } from "common-types";
import { Model } from "../Model";
export declare type ISchemaRelationshipType = "hasMany" | "ownedBy";
export interface ISchemaOptions<T extends Model = any> {
    /** Optionally specify a root path to store this schema under */
    dbOffset?: string;
    /** Optionally specify a root path where the local store will put this schema */
    localOffset?: string;
    property?: (prop: keyof T) => ISchemaMetaProperties<T>;
    audit?: boolean;
    /** A list of all properties and associated meta-data for the given schema */
    properties?: Array<ISchemaMetaProperties<T>>;
    /** A list of all relationships and associated meta-data for the given schema */
    relationships?: Array<ISchemaRelationshipMetaProperties<T>>;
    /** A list of properties which should be pushed using firebase push() */
    pushKeys?: string[];
}
export interface ISchemaRelationshipMetaProperties<T extends Model = Model> extends ISchemaMetaProperties<T> {
    isRelationship: true;
    isProperty: false;
    /** the general cardinality type of the relationship (aka, hasMany, ownedBy) */
    relType: ISchemaRelationshipType;
    /** The constructor for a model of the FK reference that this relationship maintains */
    fkConstructor: () => T;
}
export interface ISchemaMetaProperties<T extends Model = Model> extends IDictionary {
    /** the property name */
    property: Extract<keyof T, string>;
    /** the type of the property */
    type: string;
    /** constraint: a maximum length */
    length?: number;
    /** constraint: a minimum value */
    min?: number;
    /** constraint: a maximum value */
    max?: number;
    /** the name -- if it exists -- of the property on the FK which points back to this record */
    inverse?: string;
    /** is this prop a FK relationship to another entity/entities */
    isRelationship: boolean;
    /** is this prop an attribute of the schema (versus being a relationship) */
    isProperty?: boolean;
    /** is this property an array which is added to using firebase pushkeys? */
    pushKey?: boolean;
    /** what kind of relationship does this foreign key contain */
    relType?: ISchemaRelationshipType;
}
export declare function model(options: ISchemaOptions): ClassDecorator;
