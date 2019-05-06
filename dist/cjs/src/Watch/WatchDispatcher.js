"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const state_mgmt_1 = require("../state-mgmt");
const Record_1 = require("../Record");
const watchInitialization_1 = require("./watchInitialization");
/**
 * **watchDispatcher**
 *
 * Wraps up context captured at watch conception with
 */
exports.WatchDispatcher = (context) => (
/** a generic redux dispatch function; called by database on event */
clientHandler) => {
    if (typeof clientHandler !== "function") {
        const e = new Error(`A watcher is being setup but the dispatch function is not valid or not set!`);
        e.name = "FireModel::NotAllowed";
        throw e;
    }
    return (event) => {
        watchInitialization_1.hasInitialized[context.watcherId] = true;
        const typeLookup = {
            child_added: state_mgmt_1.FMEvents.RECORD_ADDED,
            child_removed: state_mgmt_1.FMEvents.RECORD_REMOVED,
            child_changed: state_mgmt_1.FMEvents.RECORD_CHANGED,
            child_moved: state_mgmt_1.FMEvents.RECORD_MOVED,
            value: state_mgmt_1.FMEvents.RECORD_CHANGED
        };
        const recId = typeof event.value === "object"
            ? Object.assign({ id: event.key }, event.value) : { id: event.key };
        const rec = Record_1.Record.local(context.modelConstructor, recId);
        let compositeKey;
        try {
            compositeKey = rec.compositeKey;
        }
        catch (e) {
            throw common_types_1.createError(`firemodel/composite-key`, `There was a problem getting the composite key for a ${rec.modelName} model: ${e.message}`);
        }
        const contextualizedEvent = Object.assign({
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? state_mgmt_1.FMEvents.RECORD_REMOVED
                    : state_mgmt_1.FMEvents.RECORD_CHANGED
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