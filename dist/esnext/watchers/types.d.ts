export interface IFmWatcherStartOptions {
    /**
     * optionally provide a callback to be called when
     * the response for the given watcher's query has been fetched. This is
     * useful as it indicates when the local state has been synced with the
     * server state
     */
    once?: (evt: any) => void;
    /** optionally give the watcher a name to make lookup easier when stopping */
    name?: string;
}
export declare type IWatchEventClassification = "child" | "value";
export declare type IWatchListQueries = "all" | "first" | "last" | "since" | "dormantSince" | "where" | "fromQuery" | "after" | "before" | "recent" | "inactive";
export declare type IWatcherSource = "list" | "record" | "list-of-records" | "unknown";
