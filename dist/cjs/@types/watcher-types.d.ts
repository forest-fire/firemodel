import { SerializedQuery } from "serialized-query";
import { ICompositeKey } from "./record-types";
import { FmModelConstructor } from "./general";
import { Model } from "../Model";
import { FMEvents } from "../state-mgmt";
export declare type IFmEventType = "value" | "child_added" | "child_moved" | "child_removed" | "child_changed";
export interface IFmRecordEvent<T extends Model = Model> {
    compositeKey: ICompositeKey;
    dynamicPathProperties: string[];
    eventType: IFmEventType;
    key: string;
    localPath: string;
    localPostfix?: string | "all";
    modelConstructor: FmModelConstructor<T>;
    modelName: string;
    pluralName: string;
    previousChildKey?: string;
    query: SerializedQuery;
    targetType: "path" | "query";
    type: FMEvents.RECORD_ADDED | FMEvents.RECORD_ADDED_LOCALLY | FMEvents.RECORD_CHANGED | FMEvents.RECORD_CHANGED_LOCALLY | FMEvents.RECORD_MOVED | FMEvents.RECORD_REMOVED | FMEvents.RECORD_REMOVED_LOCALLY;
    value: T;
    watcherId: string;
    watcherSource: "record" | "list";
}
