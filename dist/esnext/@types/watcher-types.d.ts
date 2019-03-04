import { SerializedQuery } from "serialized-query";
export interface IWatcherResult {
    watchId: string;
    dbPath: string;
    localPath: string;
    query: SerializedQuery;
}
