import { FmEvents } from "../state-mgmt";
import { Record } from "../Record";
import { hasInitialized } from "./watchInitialization";
import { FireModelError } from "../errors";
/**
 * **watchDispatcher**
 *
 * Wraps both start-time _watcher context_ and combines that with
 * event information (like the `key` and `dbPath`) to provide a rich
 * data environment for the `dispatch` function to operate with.
 */
export const WatchDispatcher = (
/**
 * a base/generic redux dispatch function; typically provided
 * by the frontend state management framework
 */
coreDispatchFn) => (
/** context provided by the watcher at the time in which the watcher was setup */
watcherContext) => {
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
        const eventContext = {
            type: watcherContext.eventFamily === "value"
                ? event.value === null ||
                    event.paths === null
                    ? FmEvents.RECORD_REMOVED
                    : FmEvents.RECORD_CHANGED
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