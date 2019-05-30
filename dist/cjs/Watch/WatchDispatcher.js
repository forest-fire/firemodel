"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_mgmt_1 = require("../state-mgmt");
const Record_1 = require("../Record");
const watchInitialization_1 = require("./watchInitialization");
const errors_1 = require("../errors");
const util_1 = require("../util");
/**
 * **watchDispatcher**
 *
 * Wraps Firebase event detail (meager) with as much context as is possible
 */
exports.WatchDispatcher = (context) => (
/** a generic redux dispatch function; called by database on event */
clientHandler) => {
    if (typeof clientHandler !== "function") {
        throw new errors_1.FireModelError(`A watcher is being setup but the dispatch function is not a valid function!`, "firemodel/not-allowed");
    }
    return (event) => {
        watchInitialization_1.hasInitialized[context.watcherId] = true;
        const typeLookup = {
            child_added: state_mgmt_1.FmEvents.RECORD_ADDED,
            child_removed: state_mgmt_1.FmEvents.RECORD_REMOVED,
            child_changed: state_mgmt_1.FmEvents.RECORD_CHANGED,
            child_moved: state_mgmt_1.FmEvents.RECORD_MOVED,
            value: state_mgmt_1.FmEvents.RECORD_CHANGED
        };
        const recId = typeof event.value === "object"
            ? Object.assign({ id: event.key }, event.value) : { id: event.key };
        const rec = Record_1.Record.createWith(context.modelConstructor, recId);
        let compositeKey;
        try {
            compositeKey = rec.compositeKey;
        }
        catch (e) {
            throw new errors_1.FireModelProxyError(e, `While responding to a watcher event [ id: ${context.watcherId}, ${context.query.path} ] there was a problem getting the composite key for a ${util_1.capitalize(rec.modelName)}::${rec.id} model`, `firemodel/composite-key`);
        }
        const contextualizedEvent = Object.assign({
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? state_mgmt_1.FmEvents.RECORD_REMOVED
                    : state_mgmt_1.FmEvents.RECORD_CHANGED
                : typeLookup[event.eventType],
            compositeKey
        }, context, event);
        return clientHandler(contextualizedEvent);
    };
};
function isValueBasedEvent(evt, context) {
    return evt.eventType === "value";
}
//# sourceMappingURL=WatchDispatcher.js.map