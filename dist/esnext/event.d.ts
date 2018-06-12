import { SerializedQuery } from "serialized-query";
import { Record } from "./Record";
/** Enumeration of all Firemodel Actions that will be fired */
export declare enum FMActions {
    RECORD_ADDED = "@firemodel/RECORD_ADDED",
    RECORD_CHANGED = "@firemodel/RECORD_CHANGED",
    RECORD_MOVED = "@firemodel/RECORD_MOVED",
    RECORD_REMOVED = "@firemodel/RECORD_REMOVED",
    /** Model has requested listening service */
    MODEL_START_LISTENING = "@firemodel/MODEL_START_LISTENING",
    /** Model has received initial state from **child_added** events */
    MODEL_STATE_READY = "@firemodel/MODEL_STATE_READY",
    /**
     * the time at which a _listened to_ model engages with one of it's relationships;
     * the timing of this will be dependant on the meta-data assoc with reln (aka,
     * lazy, reference, etc. )
     */
    RELATIONSHIP_ESTABLISHED = "@firemodel/RELATIONSHIP_ESTABLISHED"
}
export declare type ChildEventCallback = (snap: any, previous?: string) => void;
export declare type Dispatcher = (args: any[]) => void;
export interface IFMAction {
    type: FMActions;
    payload: any;
    model: string;
    [key: string]: any;
}
export interface IFMChildAction extends IFMAction {
    key: string;
    prevKey: string;
    path: string;
    query: SerializedQuery | null;
}
export interface IFMValueAction extends IFMAction {
    model: string;
    query: SerializedQuery | null;
}
export interface IFMStartListening extends IFMAction {
    query: SerializedQuery;
    dbPath: string;
    localPath: string;
}
/**
 *
 * @param model The model which will be listened for
 * @param ref The reference / serialized query which the streams will be setup on
 * @param dispatch The callback function which is called
 */
export declare function modelListener<T>(model: Record<T>, query: SerializedQuery<T>, dispatch?: typeof defaultDispatcher): Promise<void>;
export declare function recordListener<T>(): void;
export declare function defaultDispatcher<T = IFMAction>(action: T): any;
export declare const childEvent: <T>(eventType: import("serialized-query/node_modules/firebase-api-surface/lib/rtdb").EventType, model: Record<any>, dispatch?: typeof defaultDispatcher) => (snap: any, previous?: string) => void;
