import { SerializedQuery } from 'serialized-query';
export declare enum FMActions {
    RECORD_ADDED = "@firemodel/RECORD_ADDED",
    RECORD_CHANGED = "@firemodel/RECORD_CHANGED",
    RECORD_MOVED = "@firemodel/RECORD_MOVED",
    RECORD_REMOVED = "@firemodel/RECORD_REMOVED",
    MODEL_START_LISTENING = "@firemodel/MODEL_START_LISTENING",
    MODEL_STATE_READY = "@firemodel/MODEL_STATE_READY",
    RELATIONSHIP_ESTABLISHED = "@firemodel/RELATIONSHIP_ESTABLISHED",
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
