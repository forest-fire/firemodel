import { SerializedQuery } from "serialized-query";
import { Model } from "../Model";
import { IMultiPathUpdates } from "../FireModel";
import { ICompositeKey } from "../@types/record-types";
import { FmModelConstructor } from "../@types/general";
import { FmRelationshipType } from "../decorators/types";
import { IFirebaseWatchEvent } from "abstracted-firebase";
export declare type Extractable<T, U> = T extends U ? any : never;
export declare type NotString<T> = string extends T ? never : any;
export declare type IFMEventName<T> = string & NotString<T> & Extractable<FMEvents, T>;
/** Enumeration of all Firemodel Actions that will be fired */
export declare enum FMEvents {
    /** a list of records has been queried from DB and being dispatched to FE State Mgmt */
    RECORD_LIST = "@firemodel/RECORD_LIST",
    /** a list of records was SET to a new list of records */
    LIST_SET = "@firemodel/LIST_SET",
    /** a list of records removed */
    LIST_CLEAR = "@firemodel/LIST_CLEAR",
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
    /** An attempt to access the database was refused to lack of permissions */
    PERMISSION_DENIED = "@firemodel/PERMISSION_DENIED",
    /** The optimistic local change now needs to be rolled back due to failure in Firebase */
    RECORD_LOCAL_ROLLBACK = "@firemodel/RECORD_LOCAL_ROLLBACK",
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
    APP_DISCONNECTED = "@firemodel/APP_DISCONNECTED",
    ERROR_UNKNOWN_EVENT = "@firemodel/UNKNOWN_EVENT",
    ERROR_OTHER = "@firemodel/OTHER_ERROR"
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
export interface IFMRelationshipEvent<T extends Model = Model> extends IFmDispatchWatchContext<T> {
    fk: string;
    fkCompositeKey: ICompositeKey;
    fkModelName: string;
    fkPluralName: string;
    fkConstructor?: FmModelConstructor<T>;
    fkRelType?: FmRelationshipType;
    fkLocalPath?: string;
}
/**
 * When the watch is setup by the Watch() function, context about the
 * model, etc. is captured so that dispatch can include this information
 * along with what was sent by Firebase itself. This additional "context"
 * is defined as IFmDispatchWatchContext
 */
export interface IFmDispatchWatchContext<T extends Model = Model> {
    /** the name of the Model who's record has changed */
    modelName: string;
    /** plural name of the model */
    pluralName: string;
    /** the constructor for the Model of the record which has changed */
    modelConstructor: FmModelConstructor<T>;
    /** dynamic path properties on the database */
    dynamicPathProperties: string[];
    /** the query the watcher is based on */
    query: SerializedQuery;
    /** the path in your local state management where this Record should go */
    localPath: string;
    /** the "postFix" for local names; this is only presented when watcher is coming from a LIST */
    localPostfix?: string;
    /**
     * indicates whether watcher involved in firing this event
     * was a RECORD or LIST
     */
    watcherSource: "list" | "record";
    /**
     * an identifier of which active watcher which triggered to create this event,
     * not populated in the case of a client triggered event
     */
    watcherId?: string;
    /** the key/ID the previous state; provided only on child_moved and child_changed */
    previousChildKey?: string;
}
export interface IFMRecordClientEvent<T extends Model = Model> extends IFmDispatchWatchContext<T> {
    /** paths that will be updated; this is only provided on client originated events */
    paths?: IMultiPathUpdates[];
    dbPath: string;
    compositeKey: ICompositeKey;
    key: string;
    type: string;
    model: string;
}
export interface IFMRecordExternalEvent<T extends Model = Model> extends IFmDispatchWatchContext<T> {
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
export interface IFmContextualizedWatchEvent<T = any> extends IFmDispatchWatchContext<T>, IFirebaseWatchEvent {
    type: FMEvents;
    compositeKey: ICompositeKey;
}
