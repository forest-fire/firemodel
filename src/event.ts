import { Model } from "./index";
import { SerializedQuery } from "serialized-query";
import { FirebaseEvent, IDictionary } from "common-types";
import debounce = require("lodash.debounce");
import { snapshotToHash } from "typed-conversions";
//#region generalized structures

/** Enumeration of all Firemodel Actions that will be fired */
export enum FMActions {
  RECORD_ADDED = "@firemodel/RECORD_ADDED",
  RECORD_CHANGED = "@firemodel/RECORD_CHANGED",
  RECORD_MOVED = "@firemodel/RECORD_MOVED",
  RECORD_REMOVED = "@firemodel/RECORD_REMOVED",
  /** Model has requested listening service */
  MODEL_START_LISTENING = "@firemodel/MODEL_START_LISTENING",
  /** Model has received initial state from **child_added** events */
  MODEL_STATE_READY = "@firemodel/MODEL_STATE_READY",
  /**
   * the time at which a _listened to_ model engages with one of it's relationships;
   * the timing of this will be dependant on the meta-data assoc with reln (aka,
   * lazy, reference, etc. )
   */
  RELATIONSHIP_ESTABLISHED = "@firemodel/RELATIONSHIP_ESTABLISHED"
}

export type ChildEventCallback = (snap: any, previous?: string) => void;
export type Dispatcher = (args: any[]) => void;

export interface IFMAction {
  type: FMActions;
  payload: any;
  model: string;
  [key: string]: any;
}

export interface IFMChildAction extends IFMAction {
  key: string;
  prevKey: string;
  path: string;
  query: SerializedQuery | null;
}

export interface IFMValueAction extends IFMAction {
  model: string;
  query: SerializedQuery | null;
}

export interface IFMStartListening extends IFMAction {
  query: SerializedQuery;
  dbPath: string;
  localPath: string;
}
//#endregion

//#region specific events
/**
 *
 * @param model The model which will be listened for
 * @param ref The reference / serialized query which the streams will be setup on
 * @param dispatch The callback function which is called
 */
export async function modelListener<T>(
  model: Model<T>,
  query: SerializedQuery<T>,
  dispatch = defaultDispatcher
) {
  dispatch({
    type: FMActions.MODEL_START_LISTENING,
    model: model.modelName,
    query,
    dbPath: model.dbPath,
    localPath: model.localPath,
    payload: null
  });

  // const map = new RelationshipMap();

  const child_added = childEvent<T>(FirebaseEvent.child_added, model, dispatch);
  const child_moved = childEvent<T>(FirebaseEvent.child_moved, model, dispatch);
  const child_removed = childEvent<T>(
    FirebaseEvent.child_removed,
    model,
    dispatch
  );
  const child_changed = childEvent<T>(
    FirebaseEvent.child_changed,
    model,
    dispatch
  );

  query
    .deserialize()
    .on("child_added", model_ready(child_added, model, dispatch));
  query.deserialize().on("child_moved", child_moved);
  query.deserialize().on("child_removed", child_removed);
  query.deserialize().on("child_changed", child_changed);

  const active = await query.deserialize();
}

const model_ready = (
  child_added: ChildEventCallback,
  model: Model<any>,
  dispatch = defaultDispatcher
) => {
  const started = new Date().getTime();
  const assumedTimeLimit = 100;
  // let last: number;
  let ready = false;
  return (...args: any[]) => {
    const returnVal = child_added(args);
    if (!ready) {
      const now = new Date().getTime();
      debounce(
        () => {
          ready = true;
          dispatch({
            type: FMActions.MODEL_STATE_READY,
            model: model.modelName,
            started,
            duration: started - now
          });
        },
        assumedTimeLimit,
        {}
      );
    }
    return returnVal;
  };
};

const relationshipChanges = <T>(
  eventType: string,
  model: Model<any>,
  dispatch: Dispatcher,
  record: T
) => {
  switch (eventType) {
    case FirebaseEvent.child_added:
  }
};

export function recordListener<T>(
  model: Model<T>,
  ref: SerializedQuery,
  dispatch = defaultDispatcher
) {
  //
}

export function defaultDispatcher<T = IFMAction>(action: T): any {
  return action;
}

export const childEvent = <T>(
  eventType: FirebaseEvent,
  model: Model<any>,
  dispatch = defaultDispatcher
) => (snap: any, previous?: string) => {
  const action: IFMChildAction = {
    type: FMActions.RECORD_ADDED,
    key: snap.key,
    prevKey: previous,
    path: model.dbPath,
    model: model.modelName,
    query: null,
    payload: snap.val() as T
  };

  dispatch(action);
  if (eventType !== "child_moved") {
    relationshipChanges<T>(eventType, model, dispatch, snapshotToHash<T>(snap));
  }
};

//#endregion
