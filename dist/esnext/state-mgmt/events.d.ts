import { Model } from "../Model";
import { IDispatchEventContext, FmEvents, IFmCrudOperations } from "./index";
import { IWatcherItem } from "../state-mgmt";
import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IMultiPathUpdates } from "../FireModel";
import { EventType } from "@firebase/database-types";
export declare type IFmEventType = "value" | "child_added" | "child_moved" | "child_removed" | "child_changed";
/**
 * Meta information for events that are originated from **Firemodel**. This event
 * type is then extended with _watcher context_
 */
export interface IFmLocalEvent<T> {
    /** a FireModel event must state a type */
    type: FmEvents;
    /** same as `value.id` but added to provide consistency to Firebase events */
    key: string;
    /**
     * A Unique ID for the given event payload
     */
    transactionId: string;
    /**
     * the specific CRUD action being performed
     */
    crudAction?: IFmCrudOperations;
    eventType: EventType | "local";
    /**
     * The event's payload value
     */
    value: T;
    /**
     * **paths**
     *
     * Optionally including the full set of paths that are being updated;
     * this is included because _multi-path-sets_ are used to set not only
     * a given record but also it's FK relationships when a relationship is
     * changed. In the localized event this points to paths which will resolve
     * to two server based changes (one to the primary model, one to the FK
     * model) while maintaining the overall set operation as an atomic transaction
     */
    paths?: IMultiPathUpdates[];
    /**
     * **changed**
     *
     * An array of property names who's value has changed
     */
    changed?: Array<keyof T>;
    added?: Array<keyof T>;
    removed?: Array<keyof T>;
    /**
     * **priorValue**
     *
     * When a locally originated "update" is done the `changed` property will
     * be a hash where all the keys represent _changed_ values and the value is
     * the old/prior value.
     */
    priorValue?: T;
    errorCode?: string | number;
    errorMessage?: string;
}
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
/**
 * This represents the payload which **Firemodel** will dispatch when
 * _watcher context_ is available.
 */
export declare type IFmWatchEvent<T extends Model = Model> = IFmServerOrLocalEvent<T> & IDispatchEventContext<T> & IWatcherItem<T>;
export interface IFmUnwatchedEvent<T> extends IFmLocalEvent<T> {
}
/**
 * The extra meta-data that comes from combining
 * the _watcher context_ and the _event_
 */
export interface IDispatchEventContext<T = any> {
    type: FmEvents;
    dbPath: string;
}
