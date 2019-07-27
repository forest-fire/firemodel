import { SerializedQuery } from "serialized-query";
import { ICompositeKey } from "./record-types";
import { IPathSetter } from "abstracted-firebase";
import { FmModelConstructor } from "./general";
import { Model } from "../Model";
import { FmEvents } from "../state-mgmt";
import { IWatcherSource } from "../watchers/types";
export declare type IFmEventType = "value" | "child_added" | "child_moved" | "child_removed" | "child_changed";
export interface IFmRecordEvent<T extends Model = Model> {
    type: FmEvents;
    /** the id/key for the record */
    key: string;
    /**
     * an object/hash representation of the id/key for a _typical_ model but an object hash that includes
     * all parts of the _composite key_ if a dynamic path is being used
     */
    compositeKey: ICompositeKey<T>;
    /**
     * an array of properties -- beyond the `id` -- which make up the composite key; this will be an
     * empty array unless the Model has a "dynamic path"
     */
    dynamicPathProperties: string[];
    eventType?: IFmEventType;
    /** the _database path_ where the record being changed resides */
    dbPath: string;
    localPath: string;
    /**
     * a string used after the model name in local state management so as to allow for other
     * meta data to reside alongside it. This is by default "all" but can be changed if so
     * desired. This offsetting is only done by _list_-based watchers.
     */
    localPostfix?: string | "all";
    modelConstructor: FmModelConstructor<T>;
    /** the singular name of the **Model** */
    modelName: string;
    /** the plural name of the **Model** */
    pluralName: string;
    previousChildKey?: string;
    /** the **Firebase** _query_ used to setup the Watcher */
    query?: SerializedQuery;
    targetType?: "path" | "query";
    /** The "payload" of the event */
    value: T;
    paths?: IPathSetter[];
    /** the value prior to the change; this is typically set for local events only */
    priorValue?: T;
    /** a unique identifier of the watcher */
    watcherId?: string;
    watcherSource?: IWatcherSource;
}
