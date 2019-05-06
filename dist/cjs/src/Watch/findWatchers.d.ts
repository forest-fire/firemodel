/**
 * **findWatchers**
 *
 * Given a database path, finds all the watchers which are watching this
 * path or a parent of this path.
 */
export declare function findWatchers(dbPath: string): import("./types").IWatcherItem[];
