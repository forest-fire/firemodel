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
  /**
   * Allows stating that the payload is large; doing this will ensure that a
   * `@firemodel/WATCHER_SYNC` event is sent for list-based watchers which includes
   * all the records in a single event.
   */
  largePayload?: true;
}

export type IWatchEventClassification = "child" | "value";

export type IWatchListQueries =
  | "all"
  | "first"
  | "last"
  | "since"
  | "dormantSince"
  | "where"
  | "fromQuery"
  | "after"
  | "before"
  | "recent"
  | "inactive";

export type IWatcherSource = "list" | "record" | "list-of-records" | "unknown";
