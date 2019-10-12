import { FireModel } from "./FireModel";
import { FireModelError } from "./errors";
import { getWatcherPool, clearWatcherPool, removeFromWatcherPool } from "./watchers/watcherPool";
import { WatchList } from "./watchers/WatchList";
import { WatchRecord } from "./watchers/WatchRecord";
/**
 * A static library for interacting with _watchers_. It
 * provides the entry point into the watcher API and then
 * hands off to either `WatchList` or `WatchRecord`.
 */
export class Watch {
    /**
     * Sets the default database for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set defaultDb(db) {
        FireModel.defaultDb = db;
    }
    /**
     * Sets the default dispatch for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set dispatch(d) {
        FireModel.dispatch = d;
    }
    /**
     * returns a full list of all watchers
     */
    static get inventory() {
        return getWatcherPool();
    }
    static toJSON() {
        return Watch.inventory;
    }
    /**
     * lookup
     *
     * Allows the lookup of details regarding the actively watched
     * objects in the Firebase database
     *
     * @param hashCode the unique hashcode given for each watcher
     */
    static lookup(hashCode) {
        const codes = new Set(Object.keys(getWatcherPool()));
        if (!codes.has(hashCode)) {
            const e = new Error(`You looked up an invalid watcher hashcode [${hashCode}].`);
            e.name = "FireModel::InvalidHashcode";
            throw e;
        }
        return getWatcherPool()[hashCode];
    }
    static get watchCount() {
        return Object.keys(getWatcherPool()).length;
    }
    static reset() {
        clearWatcherPool();
    }
    /**
     * Finds the watcher by a given name and returns the ID of the
     * first match
     */
    static findByName(name) {
        const pool = getWatcherPool();
        return Object.keys(pool).find(i => pool[i].watcherName === name);
    }
    /** stops watching either a specific watcher or ALL if no hash code is provided */
    static stop(hashCode, oneOffDB) {
        const codes = new Set(Object.keys(getWatcherPool()));
        const db = oneOffDB || FireModel.defaultDb;
        if (!db) {
            throw new FireModelError(`There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`, `firemodel/no-database`);
        }
        if (hashCode && !codes.has(hashCode)) {
            const e = new FireModelError(`The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`);
            e.name = "firemodel/missing-hashcode";
            throw e;
        }
        if (!hashCode) {
            db.unWatch();
            clearWatcherPool();
        }
        else {
            const registry = getWatcherPool()[hashCode];
            db.unWatch(registry.eventFamily === "child"
                ? "value"
                : ["child_added", "child_changed", "child_moved", "child_removed"], registry.dispatch);
            removeFromWatcherPool(hashCode);
        }
    }
    /**
     * Configures the watcher to be a `value` watcher on Firebase
     * which is only concerned with changes to a singular Record.
     *
     * @param pk the _primary key_ for a given record. This can be a string
     * represention of the `id` property, a string represention of
     * the composite key, or an object representation of the composite
     * key.
     */
    static record(modelConstructor, pk, options = {}) {
        return WatchRecord.record(modelConstructor, pk, options);
    }
    static list(
    /**
     * The **Model** subType which this list watcher will watch
     */
    modelConstructor, 
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    offsets) {
        return WatchList.list(modelConstructor, { offsets });
    }
}
//# sourceMappingURL=Watch.js.map