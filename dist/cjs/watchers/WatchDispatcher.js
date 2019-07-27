"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_mgmt_1 = require("../state-mgmt");
const Record_1 = require("../Record");
const watchInitialization_1 = require("./watchInitialization");
const errors_1 = require("../errors");
/**
 * **watchDispatcher**
 *
 * Wraps Firebase event detail (meager) with as much context as is possible
 */
exports.WatchDispatcher = (watcherContext) => (
/**
 * a base/generic redux dispatch function; typically provided
 * by the frontend state management framework
 */
coreDispatchFn) => {
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
        const contextualizedEvent = Object.assign({
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? state_mgmt_1.FmEvents.RECORD_REMOVED
                    : state_mgmt_1.FmEvents.RECORD_CHANGED
                : typeLookup[event.eventType]
        }, watcherContext, event, { dbPath: rec.dbPath });
        return coreDispatchFn(contextualizedEvent);
    };
};
function isValueBasedEvent(evt, context) {
    return evt.eventType === "value";
}
//# sourceMappingURL=WatchDispatcher.js.map