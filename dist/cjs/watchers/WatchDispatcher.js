"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_mgmt_1 = require("../state-mgmt");
const Record_1 = require("../Record");
const watchInitialization_1 = require("./watchInitialization");
const errors_1 = require("../errors");
/**
 * **watchDispatcher**
 *
 * Wraps both start-time _watcher context_ and combines that with
 * event information (like the `key` and `dbPath`) to provide a rich
 * data environment for the `dispatch` function to operate with.
 */
exports.WatchDispatcher = (
/**
 * a base/generic redux dispatch function; typically provided
 * by the frontend state management framework
 */
coreDispatchFn) => (
/** context provided by the watcher at the time in which the watcher was setup */
watcherContext) => {
    if (typeof coreDispatchFn !== "function") {
        throw new errors_1.FireModelError(`A watcher is being setup but the dispatch function is not a valid function!`, "firemodel/not-allowed");
    }
    // Handle incoming events ...
    return async (event) => {
        const typeLookup = {
            child_added: state_mgmt_1.FmEvents.RECORD_ADDED,
            child_removed: state_mgmt_1.FmEvents.RECORD_REMOVED,
            child_changed: state_mgmt_1.FmEvents.RECORD_CHANGED,
            child_moved: state_mgmt_1.FmEvents.RECORD_MOVED,
            value: state_mgmt_1.FmEvents.RECORD_CHANGED
        };
        let eventContext;
        let errorMessage;
        if (event.kind === "relationship") {
            eventContext = {
                type: event.type,
                dbPath: "not-relevant, use toLocal and fromLocal"
            };
        }
        else {
            // in the case of a watcher list-of records; when the database has no
            // records yet there is no way to fulfill the dynamic path segments without
            // reaching into the watcher context
            if (watcherContext.watcherPaths) {
                const fullPath = watcherContext.watcherPaths.find(i => i.includes(event.key));
                const compositeKey = Record_1.Record.getCompositeKeyFromPath(watcherContext.modelConstructor, fullPath);
                event.value = Object.assign(Object.assign({}, (event.value || {})), compositeKey);
            }
            // record events (both server and local)
            const recordProps = typeof event.value === "object"
                ? Object.assign({ id: event.key }, event.value) : { id: event.key };
            const rec = Record_1.Record.createWith(watcherContext.modelConstructor, recordProps);
            let type;
            switch (event.kind) {
                case "record":
                    type = event.type;
                    break;
                case "server-event":
                    type =
                        event.value === null
                            ? state_mgmt_1.FmEvents.RECORD_REMOVED
                            : typeLookup[event.eventType];
                    break;
                case "watcher":
                    type = event.type;
                    break;
                default:
                    type = state_mgmt_1.FmEvents.UNEXPECTED_ERROR;
                    errorMessage = `The "kind" of event was not recognized [ ${event.kind} ]`;
            }
            eventContext = {
                type,
                dbPath: rec.dbPath
            };
        }
        const reduxAction = Object.assign(Object.assign(Object.assign({}, watcherContext), event), eventContext);
        const results = await coreDispatchFn(reduxAction);
        // The mock server and client are now in sync
        watchInitialization_1.hasInitialized(watcherContext.watcherId);
        return results;
    };
};
//# sourceMappingURL=WatchDispatcher.js.map