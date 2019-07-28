import { Model } from "../Model";
import { IFmDispatchWatchContext, IDispatchEventContext } from "../state-mgmt";
import { IFmLocalEvent } from "../watchers/types";
export declare type IFmEventType = "value" | "child_added" | "child_moved" | "child_removed" | "child_changed";
export declare type IFmEvent<T extends Model = Model> = IFmLocalEvent<T> & IFmDispatchWatchContext & IDispatchEventContext;
