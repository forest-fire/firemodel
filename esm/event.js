var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { snapshotToHash } from "typed-conversions";
export var FMActions;
(function (FMActions) {
    FMActions["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    FMActions["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    FMActions["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    FMActions["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    FMActions["MODEL_START_LISTENING"] = "@firemodel/MODEL_START_LISTENING";
    FMActions["MODEL_STATE_READY"] = "@firemodel/MODEL_STATE_READY";
    FMActions["RELATIONSHIP_ESTABLISHED"] = "@firemodel/RELATIONSHIP_ESTABLISHED";
})(FMActions || (FMActions = {}));
export function modelListener(model, query, dispatch = defaultDispatcher) {
    return __awaiter(this, void 0, void 0, function* () {
        dispatch({
            type: FMActions.MODEL_START_LISTENING,
            model: model.modelName,
            query,
            dbPath: model.dbPath,
            localPath: model.localPath,
            payload: null
        });
        const child_added = childEvent("child_added", model, dispatch);
        const child_moved = childEvent("child_moved", model, dispatch);
        const child_removed = childEvent("child_removed", model, dispatch);
        const child_changed = childEvent("child_changed", model, dispatch);
        query.deserialize().on("child_added", model_ready(child_added, model, dispatch));
        query.deserialize().on("child_moved", child_moved);
        query.deserialize().on("child_removed", child_removed);
        query.deserialize().on("child_changed", child_changed);
        const active = yield query.deserialize();
    });
}
const model_ready = (child_added, model, dispatch = defaultDispatcher) => {
    const started = new Date().getTime();
    const assumedTimeLimit = 100;
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
const relationshipChanges = (eventType, model, dispatch, record) => {
    switch (eventType) {
        case "child_added":
    }
};
export function recordListener(model, ref, dispatch = defaultDispatcher) {
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
        relationshipChanges(eventType, model, dispatch, snapshotToHash(snap));
    }
};
