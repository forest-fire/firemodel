import { Model } from "../Model";
import { IDispatchEventContext } from "../state-mgmt";
import { IFmLocalEvent } from "../watchers/types";
import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
export declare type IFmEventType = "value" | "child_added" | "child_moved" | "child_removed" | "child_changed";
/**
 * An event coming from Firebase; the event property
 * as an optional parameter to the _path based_ event
 * is just for convenience as in fact there never is a
 * value in these events but in downstream conditional logic
 * it's useful to have it listed as "optional"
 */
export declare type IFmServerEvent = IValueBasedWatchEvent | IPathBasedWatchEvent & {
    value?: any;
};
export declare type IFmServerOrLocalEvent<T> = IFmServerEvent | IFmLocalEvent<T>;
export declare type IFmEvent<T extends Model = Model> = IFmServerOrLocalEvent<T> & IDispatchEventContext<T>;
