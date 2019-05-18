import NamedFakes from "../Mock/NamedFakes";
import { Model } from "../Model";
export declare type FmRelationshipType = "hasMany" | "hasOne";
/**
 * **IFmModelMeta**
 *
 * The meta properties that describe the **Model** definition
 */
export interface IFmModelMeta<T extends Model = any> {
    /** Optionally specify a root path to store this schema under */
    dbOffset?: string;
    /** Optionally specify an explicit string for the plural name */
    plural?: string;
    /**
     * **localPrefix**
     *
     * Optionally specify a _path_ which will be _prefixed_
     * to the path in the local store. The `localPath` variable will end up
     * being combined with the `localModelName` (for a **Record** watcher) or the
     * `pluralName` (for a **List** watcher)
     */
    localPrefix?: string;
    /**
     * **localPostfix**
     *
     * For local state management, the `localPostFix` provides a
     * way to add a directory after the `localPath` for **List** watchers
     * (note: `localPostFix` is ignored in **Record** watchers). If this
     * property is _not_ set then it will default to "all".
     *
     * In most cases the default property should suffice.
     */
    localPostfix?: string;
    /**
     * **localModelName**
     *
     * When defining a model that will be used with a frontend state management
     * framework like redux, vuex, etc. the **Record** watcher will use this
     * property to build the `localPath` variable:
     *
    ```js
    localPath = pathJoin(localPrefix, localModelName);
    ```
     *
     * It's default value will be the same as `modelName` but by exposing this
     * to the `@model` decorator it allows an override where that is
     * appropriate
     */
    localModelName?: string;
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
    /** all the properties on this model; this includes props and relationships */
    allProperties?: string[];
}
export interface IFmModelRelationshipMeta<T extends Model = Model> extends IFmModelAttributeBase<T> {
    isRelationship: true;
    isProperty: false;
    /** the general cardinality type of the relationship (aka, hasMany, hasOne) */
    relType: FmRelationshipType;
    /** the property name on the related model that points back to this relationship */
    inverseProperty?: string;
    /** indicates whether the relationship is one-way or bi-directional */
    directionality: IFmRelationshipDirectionality;
    /** The constructor for a model of the FK reference that this relationship maintains */
    fkConstructor: () => new () => T;
    /** the singular name of the relationship's model */
    fkModelName?: string;
    /** the plural name of the relationship's model */
    fkPluralName?: string;
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
    /** a default value for the property if it is not already set */
    defaultValue?: any;
}
export declare type FMPropertyType = "string" | "number" | "object" | "array" | "boolean";
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
    /** a named mock can optionally recieve a set of parameters as additional input */
    mockParameters?: any[];
    /** what kind of relationship does this foreign key contain */
    relType?: FmRelationshipType;
    /** if the property is a relationship ... a constructor for the FK's Model */
    fkConstructor?: IFmFunctionToConstructor;
    fkModelName?: string;
}
export declare type MockFunction = (context: import("firemock").MockHelper) => any;
export declare type FmMockType = keyof typeof NamedFakes | MockFunction;
export interface IModelIndexMeta {
    isIndex: boolean;
    isUniqueIndex: boolean;
    desc?: string;
    property: string;
}
export declare type IFmHasOne = string;
export declare type IFmFunctionToConstructor<X = any> = () => new () => X;
export declare type IFmRelationshipDirectionality = "bi-directional" | "one-way";
