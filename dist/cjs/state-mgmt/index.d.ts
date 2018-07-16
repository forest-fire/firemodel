import { SerializedQuery } from "serialized-query";
import { Model, FMModelConstructor } from "../Model";
import { ISchemaRelationshipType } from "../decorators/schema";
import { IMultiPathUpdates } from "../FireModel";
export declare type Extractable<T, U> = T extends U ? any : never;
export declare type NotString<T> = string extends T ? never : any;
export declare type IFMEventName<T> = string & NotString<T> & Extractable<FMEvents, T>;
/** Enumeration of all Firemodel Actions that will be fired */
export declare enum FMEvents {
    /** a list of records has been queried from DB and being dispatched to FE State Mgmt */
    RECORD_LIST = "@firemodel/RECORD_LIST",
    /** A record has been added locally */
    RECORD_ADDED_LOCALLY = "@firemodel/RECORD_ADDED_LOCALLY",
    /** A record has been added to a given Model list being watched */
    RECORD_ADDED = "@firemodel/RECORD_ADDED",
    /** A record has been updated locally */
    RECORD_CHANGED_LOCALLY = "@firemodel/RECORD_CHANGED_LOCALLY",
    /** A record has been updated on Firebase */
    RECORD_CHANGED = "@firemodel/RECORD_CHANGED",
    /** for client originated events touching relationships (as external events would come back as an event per model) */
    RECORD_MOVED = "@firemodel/RECORD_MOVED",
    /** A record has been removed from a given Model list being watched */
    RECORD_REMOVED_LOCALLY = "@firemodel/RECORD_REMOVED_LOCALLY",
    /** A record has been removed from a given Model list being watched */
    RECORD_REMOVED = "@firemodel/RECORD_REMOVED",
    /** Indicates that a given model's "since" property has been updated */
    SINCE_UPDATED = "@firemodel/SINCE_UPDATED",
    /** Watcher has established connection with Firebase */
    WATCHER_STARTED = "@firemodel/WATCHER_STARTED",
    /** Watcher has disconnected an event stream from Firebase */
    WATCHER_STOPPED = "@firemodel/WATCHER_STOPPED",
    /** Watcher has disconnected all event streams from Firebase */
    WATCHER_STOPPED_ALL = "@firemodel/WATCHER_STOPPED_ALL",
    /** Relationship(s) have removed */
    RELATIONSHIP_REMOVED = "@firemodel/RELATIONSHIP_REMOVED",
    /** Relationship(s) have been removed locally */
    RELATIONSHIP_REMOVED_LOCALLY = "@firemodel/RELATIONSHIP_REMOVED_LOCALLY",
    /** Relationship(s) have added */
    RELATIONSHIP_ADDED = "@firemodel/RELATIONSHIP_ADDED",
    /** Relationship(s) have been added locally */
    RELATIONSHIP_ADDED_LOCALLY = "@firemodel/RELATIONSHIP_ADDED_LOCALLY",
    APP_CONNECTED = "@firemodel/APP_CONNECTED",
    APP_DISCONNECTED = "@firemodel/APP_DISCONNECTED"
}
export interface IFMChangedPath {
    /** a dot delimited property path to the location for local state */
    localPath: string;
    /** a dot delimited property path to the location in the database */
    dbPath: string;
    /** the value to set at this path */
    value: any;
}
/**
 * The payload triggered when a LIST object pulls back datasets from
 * the database.
 */
export interface IFMRecordListEvent<T extends Model = Model> {
    type: IFMEventName<T>;
    modelName: string;
    pluralName: string;
    dbPath: string;
    localPath: string;
    modelConstructor: new () => T;
    query: SerializedQuery;
    hashCode: number;
    records: T[];
}
export interface IFMRelationshipEvent<T extends Model = Model> extends IFMRecordEventCore<T> {
    fk: string;
    fkModelName: string;
    fkPluralName: string;
    fkConstructor?: FMModelConstructor<T>;
    fkRelType?: ISchemaRelationshipType;
    fkLocalPath?: string;
}
export interface IFMRecordEventCore<T extends Model = Model> {
    /** the unique identifier of the event type/kind */
    type: string;
    /** the name of the Model who's record has changed */
    model: string;
    /** the constructor for the Model of the record which has changed */
    modelConstructor: FMModelConstructor<T>;
    /** the path in Firebase where this Record should is stored */
    dbPath: string;
    /** the path in your local state management where this Record should go */
    localPath: string;
    /** an identifier of which active watcher which triggered to create this event, not populated in the case of a client triggered event */
    watcherHash?: string;
    /** the Record's "id" property */
    key: string;
    /** the key/ID the previous state; provided only on child_moved and child_changed */
    prevKey?: string;
}
export interface IFMRecordClientEvent<T extends Model = Model> extends IFMRecordEventCore<T> {
    /** paths that will be updated; this is only provided on client originated events */
    paths?: IMultiPathUpdates[];
}
export interface IFMRecordExternalEvent<T extends Model = Model> extends IFMRecordEventCore<T> {
    /** the value of the Record after the change */
    value: T;
}
export declare type IFMRecordEvent<T = Model> = IFMRecordClientEvent<T> & IFMRecordExternalEvent<T>;
export interface IFMAction {
    type: string;
    payload: any;
}
export interface IFMChildAction extends IFMAction {
    key: string;
    path: string;
    model: string;
    query: SerializedQuery | null;
}
export interface IFMValueAction extends IFMAction {
    model: string;
    query: SerializedQuery | null;
}
