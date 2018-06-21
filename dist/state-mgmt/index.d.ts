import { SerializedQuery } from "serialized-query";
import { Model, FMModelConstructor } from "../Model";
import { ISchemaRelationshipType } from "../decorators/schema";
import { IMultiPathUpdates } from "../FireModel";
export declare type Extractable<T, U> = T extends U ? any : never;
export declare type NotString<T> = string extends T ? never : any;
export declare type IFMEventName<T> = string & NotString<T> & Extractable<FMEvents, T>;
/** Enumeration of all Firemodel Actions that will be fired */
export declare enum FMEvents {
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
    /** Watcher has established connection with Firebase */
    WATCHER_STARTED = "@firemodel/WATCHER_STARTED",
    /** Watcher has disconnected an event stream from Firebase */
    WATCHER_STOPPED = "@firemodel/WATCHER_STOPPED",
    /** Watcher has disconnected all event streams from Firebase */
    WATCHER_STOPPED_ALL = "@firemodel/WATCHER_STOPPED_ALL",
    /** A Record has removed a relationship from another */
    RELATIONSHIP_REMOVED = "@firemodel/RELATIONSHIP_REMOVED",
    RELATIONSHIP_ADDED = "@firemodel/RELATIONSHIP_ADDED",
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
export interface IFMRelationshipEvent<T extends Model = Model> extends IFMRecordEventCore<T> {
    fk: string;
    fkModelName: string;
    fkHasInverse: boolean;
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
