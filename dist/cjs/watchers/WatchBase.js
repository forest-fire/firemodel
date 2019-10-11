"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const errors_1 = require("../errors");
const WatchDispatcher_1 = require("./WatchDispatcher");
const watchInitialization_1 = require("./watchInitialization");
const common_types_1 = require("common-types");
const watcherPool_1 = require("./watcherPool");
/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
class WatchBase {
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
        let watchHashCode;
        try {
            watchHashCode = isListOfRecords
                ? String(this._underlyingRecordWatchers[0]._query.hashCode())
                : String(this._query.hashCode());
        }
        catch (e) {
            throw new errors_1.FireModelProxyError(e, `An error occured trying to start a watcher. The source was "${this._watcherSource}" and had a query of: ${this._query}\n\nThe underlying error was: ${e.message}`, "watcher/not-allowed");
        }
        const watcherId = watchIdPrefix + "-" + watchHashCode;
        this._watcherName = options.name || `${watcherId}`;
        const watcherName = options.name || this._watcherName || `${watcherId}`;
        const watcherItem = this.buildWatcherItem(watcherName);
        // The dispatcher will now have all the context it needs to publish events
        // in a consistent fashion; this dispatch function will be used both by
        // both locally originated events AND server based events.
        const dispatch = WatchDispatcher_1.WatchDispatcher(watcherItem.dispatch)(watcherItem);
        if (!this.db) {
            throw new errors_1.FireModelError(`Attempt to start a watcher before the database connection has been established!`);
        }
        try {
            if (this._eventType === "value") {
                if (this._watcherSource === "list-of-records") {
                    // Watch all "ids" added to the list of records
                    this._underlyingRecordWatchers.forEach(r => {
                        this.db.watch(r._query, ["value"], dispatch);
                    });
                }
                else {
                    this.db.watch(this._query, ["value"], dispatch);
                }
            }
            else {
                this.db.watch(this._query, ["child_added", "child_changed", "child_moved", "child_removed"], dispatch);
            }
        }
        catch (e) {
            console.log(`Problem starting watcher [${watcherId}]: `, e);
            (this._dispatcher || index_1.FireModel.dispatch)({
                type: index_1.FmEvents.WATCHER_FAILED,
                errorMessage: e.message,
                errorCode: e.code || e.name || "firemodel/watcher-failed"
            });
            throw e;
        }
        try {
            watcherPool_1.addToWatcherPool(watcherItem);
            // dispatch "starting"; no need to wait for promise
            (this._dispatcher || index_1.FireModel.dispatch)(Object.assign({ type: index_1.FmEvents.WATCHER_STARTING }, watcherItem));
            const results = await watchInitialization_1.waitForInitialization(watcherItem);
            console.log("watcher initialized", results);
            await (this._dispatcher || index_1.FireModel.dispatch)(Object.assign({ type: index_1.FmEvents.WATCHER_STARTED }, watcherItem));
            return watcherItem;
        }
        catch (e) {
            throw common_types_1.createError("firemodel/watcher-initialization", `The watcher "${watcherId}" failed to initialize`);
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
    /**
     * Allows you to use the properties of the watcher to build a
     * `watcherContext` dictionary; this is intended to be used as
     * part of the initialization of the `dispatch` function for
     * local state management.
     *
     * **Note:** that while used here as part of the `start()` method
     * it is also used externally by locally triggered events as well
     */
    buildWatcherItem(name) {
        const dispatch = this.getCoreDispatch();
        const isListOfRecords = this._watcherSource === "list-of-records";
        const watchIdPrefix = isListOfRecords ? "wlr" : "w";
        const watchHashCode = isListOfRecords
            ? String(this._underlyingRecordWatchers[0]._query.hashCode())
            : String(this._query.hashCode());
        const watcherId = watchIdPrefix + "-" + watchHashCode;
        const watcherName = name || `${watcherId}`;
        const eventFamily = this._watcherSource === "list" ? "child" : "value";
        const watcherPaths = this._watcherSource === "list-of-records"
            ? this._underlyingRecordWatchers.map(i => i._query.path)
            : [this._query.path];
        // TODO: fix this bullshit typing; should be: SerializedQuery<T> | Array<SerializedQuery<T>>
        const query = this._watcherSource === "list-of-records"
            ? this._underlyingRecordWatchers.map(i => i._query)
            : this._query;
        const watchContext = {
            watcherId,
            watcherName,
            eventFamily,
            dispatch,
            modelConstructor: this._modelConstructor,
            query,
            dynamicPathProperties: this._dynamicProperties,
            compositeKey: this._compositeKey,
            localPath: this._localPath,
            localPostfix: this._localPostfix,
            modelName: this._modelName,
            localModelName: this._localModelName || "not-relevant",
            pluralName: this._pluralName,
            watcherPaths,
            // TODO: Fix this typing ... the error is nonsensical atm
            watcherSource: this._watcherSource,
            createdAt: new Date().getTime()
        };
        return watchContext;
    }
    getCoreDispatch() {
        // Use the bespoke dispatcher for this class if it's available;
        // if not then fall back to the default Firemodel dispatch
        const coreDispatch = this._dispatcher || index_1.FireModel.dispatch;
        if (coreDispatch.name === "defaultDispatch") {
            throw new errors_1.FireModelError(`Attempt to start a ${this._watcherSource} watcher on "${this._query.path}" but no dispatcher has been assigned. Make sure to explicitly set the dispatch function or use "FireModel.dispatch = xxx" to setup a default dispatch function.`, `firemodel/invalid-dispatch`);
        }
        return coreDispatch;
    }
    get db() {
        if (!this._db) {
            if (index_1.FireModel.defaultDb) {
                this._db = index_1.FireModel.defaultDb;
            }
        }
        return this._db;
    }
}
exports.WatchBase = WatchBase;
//# sourceMappingURL=WatchBase.js.map