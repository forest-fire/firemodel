import { debounce } from "lodash";
//#region generalized structures
/** Enumeration of all Firemodel Actions that will be fired */
export var FMActions;
(function (FMActions) {
    FMActions["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    FMActions["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    FMActions["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    FMActions["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    /** Model has requested listening service */
    FMActions["MODEL_START_LISTENING"] = "@firemodel/MODEL_START_LISTENING";
    /** Model has received initial state from **child_added** events */
    FMActions["MODEL_STATE_READY"] = "@firemodel/MODEL_STATE_READY";
    /**
     * the time at which a _listened to_ model engages with one of it's relationships;
     * the timing of this will be dependant on the meta-data assoc with reln (aka,
     * lazy, reference, etc. )
     */
    FMActions["RELATIONSHIP_ESTABLISHED"] = "@firemodel/RELATIONSHIP_ESTABLISHED";
})(FMActions || (FMActions = {}));
//#endregion
//#region specific events
/**
 *
 * @param model The model which will be listened for
 * @param ref The reference / serialized query which the streams will be setup on
 * @param dispatch The callback function which is called
 */
export async function modelListener(model, query, dispatch = defaultDispatcher) {
    dispatch({
        type: FMActions.MODEL_START_LISTENING,
        model: model.modelName,
        query,
        dbPath: model.dbPath,
        localPath: model.localPath,
        payload: null
    });
    // const map = new RelationshipMap();
    const child_added = childEvent("child_added", model, dispatch);
    const child_moved = childEvent("child_moved", model, dispatch);
    const child_removed = childEvent("child_removed", model, dispatch);
    const child_changed = childEvent("child_changed", model, dispatch);
    query.deserialize().on("child_added", model_ready(child_added, model, dispatch));
    query.deserialize().on("child_moved", child_moved);
    query.deserialize().on("child_removed", child_removed);
    query.deserialize().on("child_changed", child_changed);
}
const model_ready = (child_added, model, dispatch = defaultDispatcher) => {
    const started = new Date().getTime();
    const assumedTimeLimit = 100;
    // let last: number;
    let ready = false;
    return (...args) => {
        const returnVal = child_added(args);
        if (!ready) {
            const now = new Date().getTime();
            debounce(() => {
                ready = true;
                dispatch({
                    type: FMActions.MODEL_STATE_READY,
                    model: model.modelName,
                    started,
                    duration: started - now
                });
            }, assumedTimeLimit, {});
        }
        return returnVal;
    };
};
const relationshipChanges = (eventType) => {
    switch (eventType) {
        case "child_added":
    }
};
export function recordListener() {
    //
}
export function defaultDispatcher(action) {
    return action;
}
export const childEvent = (eventType, model, dispatch = defaultDispatcher) => (snap, previous) => {
    const action = {
        type: FMActions.RECORD_ADDED,
        key: snap.key,
        prevKey: previous,
        path: model.dbPath,
        model: model.modelName,
        query: null,
        payload: snap.val()
    };
    dispatch(action);
    if (eventType !== "child_moved") {
        relationshipChanges(eventType);
    }
};
//#endregion
//# sourceMappingURL=event.js.map