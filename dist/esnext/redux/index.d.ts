import { SerializedQuery } from 'serialized-query';
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
