import { createError } from "common-types";
import { FMEvents } from "../state-mgmt";
import { Record } from "../Record";
// TODO: This looks ugly, find time to refactor
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
export const ModelDispatchTransformer = (context) => (
/** a generic redux dispatch function; called by database on event */
clientHandler) => {
    if (typeof clientHandler !== "function") {
        const e = new Error(`A watcher is being setup but the dispatch function is not valid or not set!`);
        e.name = "FireModel::NotAllowed";
        throw e;
    }
    return (event) => {
        const typeLookup = {
            child_added: FMEvents.RECORD_ADDED,
            child_removed: FMEvents.RECORD_REMOVED,
            child_changed: FMEvents.RECORD_CHANGED,
            child_moved: FMEvents.RECORD_MOVED,
            value: FMEvents.RECORD_CHANGED
        };
        const recId = typeof event.value === "object"
            ? Object.assign({ id: event.key }, event.value) : { id: event.key };
        const rec = Record.local(context.modelConstructor, recId);
        let compositeKey;
        try {
            compositeKey = rec.compositeKey;
        }
        catch (e) {
            throw createError(`firemodel/composite-key`, `There was a problem getting the composite key for a ${rec.modelName} model: ${e.message}`);
        }
        const contextualizedEvent = Object.assign({}, context, event, {
            compositeKey,
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? FMEvents.RECORD_REMOVED
                    : FMEvents.RECORD_CHANGED
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