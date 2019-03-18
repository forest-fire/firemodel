"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const state_mgmt_1 = require("../state-mgmt");
const Record_1 = require("../Record");
// TODO: This looks ugly, find time to refactor
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
exports.ModelDispatchTransformer = (context) => (
/** a generic redux dispatch function; called by database on event */
clientHandler) => {
    if (typeof clientHandler !== "function") {
        const e = new Error(`A watcher is being setup but the dispatch function is not valid or not set!`);
        e.name = "FireModel::NotAllowed";
        throw e;
    }
    return (event) => {
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
        const contextualizedEvent = Object.assign({}, context, event, {
            compositeKey,
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? state_mgmt_1.FMEvents.RECORD_REMOVED
                    : state_mgmt_1.FMEvents.RECORD_CHANGED
                : typeLookup[event.eventType]
        });
        // console.log(contextualizedEvent, event.value);
        return clientHandler(contextualizedEvent);
    };
};
function isValueBasedEvent(evt, context) {
    return evt.eventType === "value";
}
//# sourceMappingURL=ModelDispatchTransformer.js.map