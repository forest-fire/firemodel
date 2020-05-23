"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const private_1 = require("@/private");
/**
 * A static library for interacting with _watchers_. It
 * provides the entry point into the watcher API and then
 * hands off to either `WatchList` or `WatchRecord`.
 */
class Watch {
    /**
     * Sets the default database for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set defaultDb(db) {
        private_1.FireModel.defaultDb = db;
    }
    /**
     * Sets the default dispatch for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set dispatch(d) {
        private_1.FireModel.dispatch = d;
    }
    /**
     * returns a full list of all watchers
     */
    static get inventory() {
        return private_1.getWatcherPool();
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
        const codes = new Set(Object.keys(private_1.getWatcherPool()));
        if (!codes.has(hashCode)) {
            const e = new Error(`You looked up an invalid watcher hashcode [${hashCode}].`);
            e.name = "FireModel::InvalidHashcode";
            throw e;
        }
        return private_1.getWatcherPool()[hashCode];
    }
    static get watchCount() {
        return Object.keys(private_1.getWatcherPool()).length;
    }
    static reset() {
        private_1.clearWatcherPool();
    }
    /**
     * Finds the watcher by a given name and returns the ID of the
     * first match
     */
    static findByName(name) {
        const pool = private_1.getWatcherPool();
        return Object.keys(pool).find((i) => pool[i].watcherName === name);
    }
    /**
     * stops watching either a specific watcher or ALL if no hash code is provided
     */
    static stop(hashCode, oneOffDB) {
        const codes = new Set(Object.keys(private_1.getWatcherPool()));
        const db = oneOffDB || private_1.FireModel.defaultDb;
        if (!db) {
            throw new private_1.FireModelError(`There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`, `firemodel/no-database`);
        }
        if (hashCode && !codes.has(hashCode)) {
            const e = new private_1.FireModelError(`The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`);
            e.name = "firemodel/missing-hashcode";
            throw e;
        }
        if (!hashCode) {
            const pool = private_1.getWatcherPool();
            if (Object.keys(pool).length > 0) {
                const keysAndPaths = Object.keys(pool).reduce((agg, key) => ({ ...agg, [key]: pool[key].watcherPaths }), {});
                const dispatch = pool[private_1.firstKey(pool)].dispatch;
                db.unWatch();
                private_1.clearWatcherPool();
                dispatch({
                    type: private_1.FmEvents.WATCHER_STOPPED_ALL,
                    stopped: keysAndPaths,
                });
            }
        }
        else {
            const registry = private_1.getWatcherPool()[hashCode];
            const events = registry.eventFamily === "child"
                ? "value"
                : ["child_added", "child_changed", "child_moved", "child_removed"];
            db.unWatch(events, registry.dispatch);
            // tslint:disable-next-line: no-object-literal-type-assertion
            registry.dispatch({
                type: private_1.FmEvents.WATCHER_STOPPED,
                watcherId: hashCode,
                remaining: private_1.getWatcherPoolList().map((i) => ({
                    id: i.watcherId,
                    name: i.watcherName,
                })),
            });
            private_1.removeFromWatcherPool(hashCode);
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
        return private_1.WatchRecord.record(modelConstructor, pk, options);
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
        return private_1.WatchList.list(modelConstructor, { offsets });
    }
}
exports.Watch = Watch;
//# sourceMappingURL=Watch.js.map