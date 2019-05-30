import { FmEvents } from "../state-mgmt";
import { Record } from "../Record";
import { hasInitialized } from "./watchInitialization";
import { FireModelError, FireModelProxyError } from "../errors";
import { capitalize } from "../util";
/**
 * **watchDispatcher**
 *
 * Wraps Firebase event detail (meager) with as much context as is possible
 */
export const WatchDispatcher = (context) => (
/** a generic redux dispatch function; called by database on event */
clientHandler) => {
    if (typeof clientHandler !== "function") {
        throw new FireModelError(`A watcher is being setup but the dispatch function is not a valid function!`, "firemodel/not-allowed");
    }
    return (event) => {
        hasInitialized[context.watcherId] = true;
        const typeLookup = {
            child_added: FmEvents.RECORD_ADDED,
            child_removed: FmEvents.RECORD_REMOVED,
            child_changed: FmEvents.RECORD_CHANGED,
            child_moved: FmEvents.RECORD_MOVED,
            value: FmEvents.RECORD_CHANGED
        };
        const recId = typeof event.value === "object"
            ? Object.assign({ id: event.key }, event.value) : { id: event.key };
        const rec = Record.createWith(context.modelConstructor, recId);
        let compositeKey;
        try {
            compositeKey = rec.compositeKey;
        }
        catch (e) {
            throw new FireModelProxyError(e, `While responding to a watcher event [ id: ${context.watcherId}, ${context.query.path} ] there was a problem getting the composite key for a ${capitalize(rec.modelName)}::${rec.id} model`, `firemodel/composite-key`);
        }
        const contextualizedEvent = Object.assign({
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? FmEvents.RECORD_REMOVED
                    : FmEvents.RECORD_CHANGED
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