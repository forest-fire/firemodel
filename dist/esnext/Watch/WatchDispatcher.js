import { createError } from "common-types";
import { FMEvents } from "../state-mgmt";
import { Record } from "../Record";
import { hasInitialized } from "./watchInitialization";
/**
 * **watchDispatcher**
 *
 * Wraps up context captured at watch conception with
 */
export const WatchDispatcher = (context) => (
/** a generic redux dispatch function; called by database on event */
clientHandler) => {
    if (typeof clientHandler !== "function") {
        const e = new Error(`A watcher is being setup but the dispatch function is not valid or not set!`);
        e.name = "FireModel::NotAllowed";
        throw e;
    }
    return (event) => {
        hasInitialized[context.watcherId] = true;
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
        const contextualizedEvent = Object.assign({
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? FMEvents.RECORD_REMOVED
                    : FMEvents.RECORD_CHANGED
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