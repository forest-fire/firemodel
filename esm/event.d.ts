import { Model } from "./index";
import { SerializedQuery } from "serialized-query";
import { rtdb } from "firebase-api-surface";
export declare enum FMActions {
    RECORD_ADDED = "@firemodel/RECORD_ADDED",
    RECORD_CHANGED = "@firemodel/RECORD_CHANGED",
    RECORD_MOVED = "@firemodel/RECORD_MOVED",
    RECORD_REMOVED = "@firemodel/RECORD_REMOVED",
    MODEL_START_LISTENING = "@firemodel/MODEL_START_LISTENING",
    MODEL_STATE_READY = "@firemodel/MODEL_STATE_READY",
    RELATIONSHIP_ESTABLISHED = "@firemodel/RELATIONSHIP_ESTABLISHED",
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
export declare function modelListener<T>(model: Model<T>, query: SerializedQuery<T>, dispatch?: typeof defaultDispatcher): Promise<void>;
export declare function recordListener<T>(model: Model<T>, ref: SerializedQuery, dispatch?: typeof defaultDispatcher): void;
export declare function defaultDispatcher<T = IFMAction>(action: T): any;
export declare const childEvent: <T>(eventType: rtdb.EventType, model: Model<any>, dispatch?: <T = IFMAction>(action: T) => any) => (snap: any, previous?: string) => void;
