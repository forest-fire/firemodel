import { RealTimeDB } from "abstracted-firebase";
import { Model } from "./Model";
import { Omit } from "common-types";
import { FireModel } from "./FireModel";
import { IReduxDispatch } from "./VuexWrapper";
import { IFMEventName } from "./state-mgmt/index";
import { IAuditChange, IAuditOperations } from "./Audit";
import { IIdWithDynamicPrefix, IFkReference, ICompositeKey } from "./@types/record-types";
import { IModelOptions } from "./@types/general";
export declare type ModelOptionalId<T extends Model> = Omit<T, "id"> & {
    id?: string;
};
export interface IWriteOperation {
    id: string;
    type: "set" | "pushKey" | "update";
    /** The database path being written to */
    path: string;
    /** The new value being written to database */
    value: any;
    /** called on positive confirmation received from server */
    callback: (type: string, value: any) => void;
}
export interface IRecordOptions {
    db?: RealTimeDB;
    logging?: any;
    id?: string;
    /** if you're working off of a mocking database, there are situations where adding a record silently (aka., not triggering any listener events) is desirable and should be allowed */
    silent?: boolean;
}
export declare class Record<T extends Model> extends FireModel<T> {
    static defaultDb: RealTimeDB;
    static dispatch: IReduxDispatch;
    readonly data: Readonly<T>;
    /**
    * deprecated
    */
    isDirty: boolean;
    /**
     * returns the fully qualified name in the database to this record;
     * this of course includes the record id so if that's not set yet calling
     * this getter will result in an error
     */
    readonly dbPath: string;
    /**
     * provides a boolean flag which indicates whether the underlying
     * model has a "dynamic path" which ultimately comes from a dynamic
     * component in the "dbOffset" property defined in the model decorator
     */
    readonly hasDynamicPath: boolean;
    /**
     * An array of "dynamic properties" that are derived fom the "dbOffset" to
     * produce the "dbPath"
     */
    readonly dynamicPathComponents: string[];
    /**
     * the list of dynamic properties in the "localPrefix"
     * which must be resolved to achieve the "localPath"
     */
    readonly localDynamicComponents: string[];
    /**
     * A hash of values -- including at least "id" -- which represent
     * the composite key of a model.
     */
    readonly compositeKey: ICompositeKey;
    /**
     * a string value which is used in relationships to fully qualify
     * a composite string (aka, a model which has a dynamic dbOffset)
     */
    readonly compositeKeyRef: any;
    /** The Record's primary key */
    id: string;
    /**
     * returns the record's database offset without including the ID of the record;
     * among other things this can be useful prior to establishing an ID for a record
     */
    readonly dbOffset: string;
    /**
     * returns the record's location in the frontend state management framework;
     * this can include dynamic properties characterized in the path string by
     * leading ":" character.
     */
    readonly localPath: string;
    /**
     * The path in the local state tree that brings you to
     * the record; this is differnt when retrieved from a
     * Record versus a List.
     */
    readonly localPrefix: string;
    readonly existsOnDB: boolean;
    /** indicates whether this record is already being watched locally */
    readonly isBeingWatched: boolean;
    /**
     * create
     *
     * creates a new -- and empty -- Record object; often used in
     * conjunction with the Record's initialize() method
     */
    static create<T extends Model>(model: new () => T, options?: IRecordOptions): Record<T>;
    /**
     * add
     *
     * Adds a new record to the database
     *
     * @param schema the schema of the record
     * @param payload the data for the new record; this optionally can include the "id" but if left off the new record will use a firebase pushkey
     * @param options
     */
    static add<T extends Model>(model: new () => T, payload: ModelOptionalId<T>, options?: IRecordOptions): Promise<Record<T>>;
    /**
     * update
     *
     * update an existing record in the database
     *
     * @param schema the schema of the record
     * @param payload the data for the new record
     * @param options
     */
    static update<T extends Model>(model: new () => T, id: string, updates: Partial<T>, options?: IRecordOptions): Promise<Record<T>>;
    /**
     * load
     *
     * static method to create a Record when you want to load the
     * state of the record with something you already have.
     *
     * Intent should be that this record already exists in the
     * database. If you want to add to the database then use add()
     */
    static createWith<T extends Model>(model: new () => T, payload: T, options?: IRecordOptions): Record<T>;
    /**
     * get (static initializer)
     *
     * Allows the retrieval of records based on the record's id (and dynamic path prefixes
     * in cases where that applies)
     *
     * @param model the model definition you are retrieving
     * @param id either just an "id" string or in the case of models with dynamic path prefixes you can pass in an object with the id and all dynamic prefixes
     * @param options
     */
    static get<T extends Model>(model: new () => T, id: string | IIdWithDynamicPrefix, options?: IRecordOptions): Promise<Record<T>>;
    static remove<T extends Model>(model: new () => T, id: IFkReference, 
    /** if there is a known current state of this model you can avoid a DB call to get it */
    currentState?: Record<T>): Promise<Record<T>>;
    private _existsOnDB;
    private _writeOperations;
    private _data?;
    constructor(model: new () => T, options?: IRecordOptions);
    /**
     * Goes out to the database and reloads this record
     */
    reload(): Promise<Record<T>>;
    /**
     * addAnother
     *
     * Allows a simple way to add another record to the database
     * without needing the model's constructor fuction. Note, that
     * the payload of the existing record is ignored in the creation
     * of the new.
     *
     * @param payload the payload of the new record
     */
    addAnother(payload: T): Promise<Record<T>>;
    isSameModelAs(model: new () => any): boolean;
    /**
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    _initialize(data: T): void;
    /**
     * Pushes new values onto properties on the record
     * which have been stated to be a "pushKey"
     */
    pushKey<K extends keyof T>(property: K, value: T[K][keyof T[K]]): Promise<string>;
    /**
     * Updates a set of properties on a given model atomically (aka, all at once); will automatically
     * include the "lastUpdated" property. Does NOT allow relationships to be included,
     * this should be done separately.
     *
     * @param props a hash of name value pairs which represent the props being updated and their new values
     */
    update(props: Partial<T>): Promise<void>;
    /**
     * remove
     *
     * Removes the active record from the database and dispatches the change to
     * FE State Mgmt.
     */
    remove(): Promise<void>;
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     */
    set<K extends keyof T>(prop: K, value: T[K]): Promise<void>;
    /**
     * associate
     *
     * Associates the current model with another regardless if the cardinality is 1 or M.
     * If it is a "hasOne" relationship it will proxy this request to setRelationship,
     * if it is a "hasMany" relationshipo it will proxy this request to addToRelationship
     */
    associate(property: Extract<keyof T, string>, refs: IFkReference | IFkReference[], optionalValue?: any): Promise<void>;
    disassociate(property: Extract<keyof T, string>, refs?: IFkReference | IFkReference[]): Promise<void>;
    /**
     * Adds one or more fk's to a hasMany relationship
     *
     * @param property the property which is acting as a foreign key (array)
     * @param fkRefs FK reference (or array of FKs) that should be added to reln
     * @param value the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead
     */
    addToRelationship(property: Extract<keyof T, string>, fkRefs: IFkReference | IFkReference[], value?: any): Promise<void>;
    /**
     * removeFromRelationship
     *
     * remove one or more IDs from a hasMany relationship
     *
     * @param property the property which is acting as a FK
     * @param fkRefs the IDs on the properties FK which should be removed
     */
    removeFromRelationship(property: Extract<keyof T, string>, fkRefs: IFkReference | IFkReference[]): Promise<void>;
    /**
     * clearRelationship
     *
     * clears an existing FK on a hasOne relationship
     *
     * @param property the property containing the hasOne FK
     */
    clearRelationship(property: Extract<keyof T, string>): Promise<void>;
    /**
     * setRelationship
     *
     * sets up an hasOne FK relationship
     *
     * @param property the property containing the hasOne FK
     * @param ref the FK
     */
    setRelationship(property: Extract<keyof T, string>, ref: IFkReference, optionalValue?: any): Promise<void>;
    /**
     * get a property value from the record
     *
     * @param prop the property being retrieved
     */
    get<K extends keyof T>(prop: K): Readonly<T>[K];
    toString(): string;
    toJSON(): {
        dbPath: string;
        modelName: string;
        pluralName: any;
        key: string;
        compositeKey: ICompositeKey;
        localPath: string;
        data: string;
    };
    protected _writeAudit(action: IAuditOperations, changes?: IAuditChange[], options?: IModelOptions): void;
    protected _expandFkStringToCompositeNotation(fkRef: string, dynamicComponents?: string[]): {
        id: string;
    };
    /**
     * _relationshipMPS
     *
     * Sets up and executes a multi-path SET (MPS) with the intent of
     * updating the FK relationship of a given model as well as reflecting
     * that change back from the FK to the originating model
     *
     * @param mps the multi-path selection object
     * @param fkRef a FK reference; either a string (representing the ID of other
     * record) or a composite key (ID plus all dynamic segments)
     * @param property the property on the target record which contains FK(s)
     * @param value the value to set this FK (null removes); typically TRUE if setting
     * @param now the current time in miliseconds
     */
    protected _relationshipMPS(mps: any, fkRef: IFkReference, property: Extract<keyof T, string>, value: any, now: number): void;
    protected _errorIfNothasOneReln(property: Extract<keyof T, string>, fn: string): void;
    protected _errorIfNotHasManyReln(property: Extract<keyof T, string>, fn: string): void;
    protected _updateProps<K extends IFMEventName<K>>(actionTypeStart: K, actionTypeEnd: K, changed: Partial<T>): Promise<void>;
    private _findDynamicComponents;
    /**
     * looks for ":name" property references within the dbOffset or localPrefix and expands them
     */
    private _injectDynamicPathProperties;
    /**
     * Load data from a record in database
     */
    private _getFromDB;
    private _adding;
}
