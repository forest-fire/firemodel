import { FMEvents } from "./state-mgmt";
import { Record } from "./Record";
// TODO: This looks ugly, find time to refactor
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
export const ModelDispatchTransformer = (context) => (clientHandler) => {
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
            child_moved: FMEvents.RECORD_MOVED
        };
        const recId = typeof event.value === "object"
            ? Object.assign({ id: event.key }, event.value) : { id: event.key };
        const rec = Record.local(context.modelConstructor, recId);
        let compositeKey;
        try {
            compositeKey = rec.compositeKey;
        }
        catch (e) {
            if (e.code === "record/not-ready") {
                // TODO: this may need checking
                compositeKey = { id: "" };
            }
        }
        const contextualizedEvent = Object.assign({}, context, event, {
            compositeKey,
            type: event.eventType === "value"
                ? event.value === null
                    ? FMEvents.RECORD_REMOVED
                    : FMEvents.RECORD_CHANGED
                : typeLookup[event.eventType]
        });
        return clientHandler(contextualizedEvent);
    };
};
//# sourceMappingURL=ModelDispatchTransformer.js.map