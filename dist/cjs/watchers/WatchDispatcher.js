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
        watchInitialization_1.hasInitialized[watcherContext.watcherId] = true;
        const typeLookup = {
            child_added: state_mgmt_1.FmEvents.RECORD_ADDED,
            child_removed: state_mgmt_1.FmEvents.RECORD_REMOVED,
            child_changed: state_mgmt_1.FmEvents.RECORD_CHANGED,
            child_moved: state_mgmt_1.FmEvents.RECORD_MOVED,
            value: state_mgmt_1.FmEvents.RECORD_CHANGED
        };
        const recordProps = typeof event.value === "object"
            ? Object.assign({ id: event.key }, event.value) : { id: event.key };
        const rec = Record_1.Record.createWith(watcherContext.modelConstructor, recordProps);
        const eventContext = {
            type: watcherContext.eventFamily === "value"
                ? event.value === null ||
                    event.paths === null
                    ? state_mgmt_1.FmEvents.RECORD_REMOVED
                    : state_mgmt_1.FmEvents.RECORD_CHANGED
                : typeLookup[event.eventType],
            dbPath: rec.dbPath
        };
        /**
         * _local events_ will be explicit about the **Action**
         * they are trying to set; in comparison the server events
         * will be determined at run time (using watcher context)
         */
        if (event.type) {
            eventContext.type = event.type;
        }
        const reduxAction = Object.assign({}, watcherContext, eventContext, event);
        return coreDispatchFn(reduxAction);
    };
};
//# sourceMappingURL=WatchDispatcher.js.map