import "reflect-metadata";
import { ClassDecorator } from "common-types";
import { Model } from "../Model";
import { IModelIndexMeta } from "./indexing";
import { FmMockType } from "./constraints";
export declare type FmRelationshipType = "hasMany" | "hasOne";
export interface IFmModelMeta<T extends Model = any> {
    /** Optionally specify a root path to store this schema under */
    dbOffset?: string;
    /** Optionally specify an explicit string for the plural name */
    plural?: string;
    /** Optionally specify a root path where the local store will put this schema */
    localOffset?: string;
    /** Optionally specify a post-fix to the path where lists of records will be stored; by default this is set to "all" */
    localPostfix?: string;
    /** provides a boolean flag on whether the stated name is a property */
    isProperty?: (prop: keyof T) => boolean;
    /** a function to lookup the meta properties of a given property */
    property?: (prop: keyof T) => IFmModelPropertyMeta<T>;
    /** provides a boolean flag on whether the stated name is a property */
    isRelationship?: (prop: keyof T) => boolean;
    /** a function to lookup the meta properties of a given relationship */
    relationship?: (prop: keyof T) => IFmModelRelationshipMeta<T>;
    audit?: boolean | "server";
    /** A list of all properties and associated meta-data for the given schema */
    properties?: Array<IFmModelPropertyMeta<T>>;
    /** A list of all relationships and associated meta-data for the given schema */
    relationships?: Array<IFmModelRelationshipMeta<T>>;
    /** A list of properties which should be pushed using firebase push() */
    pushKeys?: string[];
    /** indicates whether this property has been changed on client but not yet accepted by server */
    isDirty?: boolean;
    /** get a list the list of database indexes on the given model */
    dbIndexes?: IModelIndexMeta[];
}
export interface IFmModelRelationshipMeta<T extends Model = Model> extends IFmModelAttributeBase<T> {
    isRelationship: true;
    isProperty: false;
    /** the general cardinality type of the relationship (aka, hasMany, hasOne) */
    relType: FmRelationshipType;
    /** the property name on the related model that points back to this relationship */
    inverseProperty?: string;
    /** The constructor for a model of the FK reference that this relationship maintains */
    fkConstructor: new () => T;
    /** the singular name of the relationship's model */
    fkModelName: string;
    /** the plural name of the relationship's model */
    fkPluralName: string;
    /** the name -- if it exists -- of the property on the FK which points back to this record */
    inverse?: string;
}
export interface IFmModelPropertyMeta<T extends Model = Model> extends IFmModelAttributeBase<T> {
    /** constraint: a maximum length */
    length?: number;
    /** the minimum length of the property */
    min?: number;
    /** the maximum length of the property */
    max?: number;
    /** is this prop a FK relationship to another entity/entities */
    isRelationship?: boolean;
    /** is this prop an attribute of the schema (versus being a relationship) */
    isProperty?: boolean;
    /** is this property an array which is added to using firebase pushkeys? */
    pushKey?: boolean;
}
export declare type FMPropertyType = "string" | "number" | "object" | "array";
export interface IFmModelAttributeBase<T> {
    /** the property name */
    property: Extract<keyof T, string>;
    /** the property's "typed value" */
    type: FMPropertyType;
    /** constraint: a maximum length */
    length?: number;
    /** constraint: a minimum value */
    min?: number;
    /** constraint: a maximum value */
    max?: number;
    /** is this prop a FK relationship to another entity/entities */
    isRelationship?: boolean;
    /** is this prop an attribute of the schema (versus being a relationship) */
    isProperty?: boolean;
    /** is this property an array which is added to using firebase pushkeys? */
    pushKey?: boolean;
    /**
     * a name or function of a type of data which can be mocked
     * in a more complete way than just it's stict "type". Examples
     * would include "telephone", "name", etc.
     */
    mockType?: FmMockType;
    /** what kind of relationship does this foreign key contain */
    relType?: FmRelationshipType;
    /** if the property is a relationship ... a constructor for the FK's Model */
    fkConstructor?: new () => any;
    fkModelName?: string;
}
export declare function model(options: Partial<IFmModelMeta>): ClassDecorator;
