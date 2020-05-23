import { IWatcherEventContext } from "@/private";
/**
 * **findWatchers**
 *
 * Given a database path, finds all the watchers which are watching this
 * path or a parent of this path. This must consider a normal **list** or
 * **record** watcher but also a **list-of-records** where instead of a
 * `1:1` relationship between "watcher" and Firebase listener there is instead
 * a `1:M` relationship.
 */
export declare function findWatchers(
/** the database path where change was detected */
dbPath: string): IWatcherEventContext<any>[];
