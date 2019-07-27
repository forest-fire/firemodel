import { FmEvents } from "../state-mgmt";
import { Record } from "../Record";
import { hasInitialized } from "./watchInitialization";
import { FireModelError } from "../errors";
/**
 * **watchDispatcher**
 *
 * Wraps Firebase event detail (meager) with as much context as is possible
 */
export const WatchDispatcher = (watcherContext) => (
/**
 * a base/generic redux dispatch function; typically provided
 * by the frontend state management framework
 */
coreDispatchFn) => {
    if (typeof coreDispatchFn !== "function") {
        throw new FireModelError(`A watcher is being setup but the dispatch function is not a valid function!`, "firemodel/not-allowed");
    }
    // Handle incoming events ...
    return async (event) => {
        hasInitialized[watcherContext.watcherId] = true;
        const typeLookup = {
            child_added: FmEvents.RECORD_ADDED,
            child_removed: FmEvents.RECORD_REMOVED,
            child_changed: FmEvents.RECORD_CHANGED,
            child_moved: FmEvents.RECORD_MOVED,
            value: FmEvents.RECORD_CHANGED
        };
        const recordProps = typeof event.value === "object"
            ? Object.assign({ id: event.key }, event.value) : { id: event.key };
        const rec = Record.createWith(watcherContext.modelConstructor, recordProps);
        const contextualizedEvent = Object.assign({
            type: event.eventType === "value"
                ? event.value === null || event.paths === null
                    ? FmEvents.RECORD_REMOVED
                    : FmEvents.RECORD_CHANGED
                : typeLookup[event.eventType]
        }, watcherContext, event, { dbPath: rec.dbPath });
        return coreDispatchFn(contextualizedEvent);
    };
};
function isValueBasedEvent(evt, context) {
    return evt.eventType === "value";
}
//# sourceMappingURL=WatchDispatcher.js.map