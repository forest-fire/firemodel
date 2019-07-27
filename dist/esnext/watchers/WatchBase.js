import { FireModel, FmEvents } from "..";
import { FireModelError } from "../errors";
import { WatchDispatcher } from "./WatchDispatcher";
import { waitForInitialization } from "./watchInitialization";
import { createError } from "common-types";
import { addToWatcherPool } from "./watcherPool";
/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
export class WatchBase {
    constructor() {
        /**
         * this is only to accomodate the list watcher using `ids` which is an aggregate of
         * `record` watchers.
         */
        this._underlyingRecordWatchers = [];
    }
    /**
     * **start**
     *
     * executes the watcher (`WatchList` or `WatchRecord`) so that it becomes
     * actively watched
     */
    async start(options = {}) {
        const isListOfRecords = this._watcherSource === "list-of-records";
        const watchIdPrefix = isListOfRecords ? "wlr" : "w";
        const watchHashCode = isListOfRecords
            ? String(this._underlyingRecordWatchers[0]._query.hashCode())
            : String(this._query.hashCode());
        const watcherId = watchIdPrefix + "-" + watchHashCode;
        const watcherName = options.name || `${watcherId}`;
        const watcherPath = this._watcherSource === "list-of-records"
            ? this._underlyingRecordWatchers.map(i => i._query.path)
            : this._query.path;
        const query = this._watcherSource === "list-of-records"
            ? this._underlyingRecordWatchers.map(i => i._query)
            : this._query;
        // context that comes purely from the Watcher
        const watchContext = {
            watcherId,
            watcherName,
            modelConstructor: this._modelConstructor,
            query,
            dynamicPathProperties: this._dynamicProperties,
            compositeKey: this._compositeKey,
            localPath: this._localPath,
            localPostfix: this._localPostfix,
            modelName: this._modelName,
            localModelName: this._localModelName || "not-relevant",
            pluralName: this._pluralName,
            watcherPath,
            watcherSource: this._watcherSource
        };
        // Use the bespoke dispatcher for this class if it's available;
        // if not then fall back to the default Firemodel dispatch
        const coreDispatch = this._dispatcher || FireModel.dispatch;
        if (coreDispatch.name === "defaultDispatch") {
            throw new FireModelError(`Attempt to start a ${this._watcherSource} watcher on "${this._query.path}" but no dispatcher has been assigned. Make sure to explicitly set the dispatch function or use "FireModel.dispatch = xxx" to setup a default dispatch function.`, `firemodel/invalid-dispatch`);
        }
        if (!this.db) {
            throw new FireModelError(`Attempt to start a watcher before the database connection has been established!`);
        }
        // The dispatcher will now have all the context it needs to publish events
        // in a consistent fashion; this dispatch function will be used both by
        // both locally originated events AND server based events.
        const dispatchCallback = WatchDispatcher(watchContext)(coreDispatch);
        try {
            if (this._eventType === "value") {
                if (this._watcherSource === "list-of-records") {
                    // Watch all "ids" added to the list of records
                    this._underlyingRecordWatchers.forEach(r => {
                        this.db.watch(r._query, ["value"], dispatchCallback);
                    });
                }
                else {
                    this.db.watch(this._query, ["value"], dispatchCallback);
                }
            }
            else {
                this.db.watch(this._query, ["child_added", "child_changed", "child_moved", "child_removed"], dispatchCallback);
            }
        }
        catch (e) {
            console.log(`Problem starting watcher [${watcherId}]: `, e);
            (this._dispatcher || FireModel.dispatch)({
                type: FmEvents.WATCHER_FAILED,
                errorMessage: e.message,
                errorCode: e.code || e.name || "firemodel/watcher-failed"
            });
            throw e;
        }
        // TODO: this needs to be set back to `IWatcherItem`
        const watcherItem = {
            watcherId,
            watcherName,
            eventType: this._eventType,
            watcherSource: this._watcherSource,
            dispatch: this._dispatcher || FireModel.dispatch,
            query: this._watcherSource === "list-of-records"
                ? this._underlyingRecordWatchers.map(i => i._query)
                : this._query,
            dbPath: this._watcherSource === "list-of-records"
                ? this._underlyingRecordWatchers.map(i => i._query.path)
                : this._query.path,
            localPath: this._localPath,
            createdAt: new Date().getTime()
        };
        addToWatcherPool(watcherItem);
        // dispatch meta
        (this._dispatcher || FireModel.dispatch)(Object.assign({ type: FmEvents.WATCHER_STARTING }, watcherItem));
        try {
            await waitForInitialization(watcherItem);
            (this._dispatcher || FireModel.dispatch)(Object.assign({ type: FmEvents.WATCHER_STARTED }, watcherItem));
            return watcherItem;
        }
        catch (e) {
            throw createError("firemodel/watcher-initialization", `The watcher "${watcherId}" failed to initialize`);
        }
    }
    /**
     * **dispatch**
     *
     * allows you to state an explicit dispatch function which will be called
     * when this watcher detects a change; by default it will use the "default dispatch"
     * set on FireModel.dispatch.
     */
    dispatch(d) {
        this._dispatcher = d;
        return this;
    }
    toString() {
        return `Watching path "${this._query.path}" for "${this._eventType}" event(s) [ hashcode: ${String(this._query.hashCode())} ]`;
    }
    get db() {
        if (!this._db) {
            if (FireModel.defaultDb) {
                this._db = FireModel.defaultDb;
            }
        }
        return this._db;
    }
}
//# sourceMappingURL=WatchBase.js.map