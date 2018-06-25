import { RealTimeDB } from "abstracted-firebase";
import { Model, IModelOptions } from "./Model";
import { fk } from "common-types";
import { FireModel } from "./FireModel";
import { IReduxDispatch } from "./VuexWrapper";
import { IFMEventName } from "./state-mgmt/index";
import { IAuditChange, IAuditOperations } from "./Audit";
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
     * @param payload the data for the new record
     * @param options
     */
    static add<T extends Model>(model: new () => T, payload: T, options?: IRecordOptions): Promise<Record<T>>;
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
    static get<T extends Model>(model: new () => T, id: string, options?: IRecordOptions): Promise<Record<T>>;
    static remove<T extends Model>(model: new () => T, id: string, 
    /** if there is a known current state of this model you can avoid a DB call to get it */
    currentState?: Record<T>): Promise<Record<T>>;
    private _existsOnDB;
    private _writeOperations;
    private _data?;
    constructor(model: new () => T, options?: IRecordOptions);
    readonly data: Readonly<T>;
    /**
    * set the dirty flag of the model
    */
    isDirty: boolean;
    /**
     * returns the fully qualified name in the database to this record;
     * this of course includes the record id so if that's not set yet calling
     * this getter will result in an error
     */
    readonly dbPath: string;
    /** The Record's primary key */
    id: string;
    /**
     * returns the record's database offset without including the ID of the record;
     * among other things this can be useful prior to establishing an ID for a record
     */
    readonly dbOffset: string;
    /**
     * returns the record's location in the frontend state management framework;
     * depends on appropriate configuration of model to be accurate.
     */
    readonly localPath: string;
    /**
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    _initialize(data: T): void;
    readonly existsOnDB: boolean;
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
     * Adds one or more fk's to a hasMany relationship
     *
     * @param property the property which is acting as a foreign key (array)
     * @param refs FK reference (or array of FKs) that should be added to reln
     * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
     */
    addToRelationship(property: Extract<keyof T, string>, refs: Extract<fk, string> | Array<Extract<fk, string>>, optionalValue?: any): Promise<void>;
    /**
     * removeFromRelationship
     *
     * remove one or more IDs from a hasMany relationship
     *
     * @param property the property which is acting as a FK
     * @param refs the IDs on the properties FK which should be removed
     */
    removeFromRelationship(property: Extract<keyof T, string>, refs: Extract<fk, string> | Array<Extract<fk, string>>): Promise<void>;
    /**
     * clearRelationship
     *
     * clears an existing FK on a ownedBy relationship
     *
     * @param property the property containing the ownedBy FK
     */
    clearRelationship(property: Extract<keyof T, string>): Promise<void>;
    /**
     * setRelationship
     *
     * sets up an ownedBy FK relationship
     *
     * @param property the property containing the ownedBy FK
     * @param ref the FK
     */
    setRelationship(property: Extract<keyof T, string>, ref: Extract<fk, string>, optionalValue?: any): Promise<void>;
    /** indicates whether this record is already being watched locally */
    readonly isBeingWatched: boolean;
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
        localPath: string;
        data: string;
    };
    protected _writeAudit(action: IAuditOperations, changes?: IAuditChange[], options?: IModelOptions): void;
    /**
     * _relationshipMPS
     *
     * @param mps the multi-path selection object
     * @param ref the FK reference
     * @param property the property on the target record which contains FK(s)
     * @param value the value to set this FK (null removes)
     * @param now the current time in miliseconds
     */
    protected _relationshipMPS(mps: any, ref: string, property: Extract<keyof T, string>, value: any, now: number): void;
    protected _errorIfNotOwnedByReln(property: Extract<keyof T, string>, fn: string): void;
    protected _errorIfNotHasManyReln(property: Extract<keyof T, string>, fn: string): void;
    protected _updateProps<K extends IFMEventName<K>>(actionTypeStart: K, actionTypeEnd: K, changed: Partial<T>): Promise<void>;
    /**
     * Load data from a record in database
     */
    private _getFromDB;
    private _save;
}
