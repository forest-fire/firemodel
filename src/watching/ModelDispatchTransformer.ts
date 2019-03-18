import { IReduxDispatch } from "../VuexWrapper";
import { IDictionary, createError } from "common-types";
import {
  IFirebaseWatchEvent,
  IFirebaseWatchContext,
  IValueBasedWatchEvent,
  IPathBasedWatchEvent
} from "abstracted-firebase";
import {
  FMEvents,
  IFmDispatchWatchContext,
  IFmContextualizedWatchEvent
} from "../state-mgmt";
import { Record } from "../Record";
import { IFmRecordEvent } from "../@types/watcher-types";

// TODO: This looks ugly, find time to refactor
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
export const ModelDispatchTransformer = <T>(
  context: IFmDispatchWatchContext<T>
) => (
  /** a generic redux dispatch function; called by database on event */
  clientHandler: IReduxDispatch<IFmContextualizedWatchEvent<T>>
) => {
  if (typeof clientHandler !== "function") {
    const e = new Error(
      `A watcher is being setup but the dispatch function is not valid or not set!`
    );
    e.name = "FireModel::NotAllowed";
    throw e;
  }

  return (event: IValueBasedWatchEvent & IPathBasedWatchEvent) => {
    const typeLookup: IDictionary = {
      child_added: FMEvents.RECORD_ADDED,
      child_removed: FMEvents.RECORD_REMOVED,
      child_changed: FMEvents.RECORD_CHANGED,
      child_moved: FMEvents.RECORD_MOVED,
      value: FMEvents.RECORD_CHANGED
    };

    const recId =
      typeof event.value === "object"
        ? { id: event.key, ...event.value }
        : { id: event.key };
    const rec = Record.local(context.modelConstructor, recId);
    let compositeKey;
    try {
      compositeKey = rec.compositeKey;
    } catch (e) {
      throw createError(
        `firemodel/composite-key`,
        `There was a problem getting the composite key for a ${
          rec.modelName
        } model: ${e.message}`
      );
    }

    const contextualizedEvent: IFmContextualizedWatchEvent<T> = {
      ...context,
      ...event,
      ...{
        compositeKey,
        type:
          event.eventType === "value"
            ? event.value === null || event.paths === null
              ? FMEvents.RECORD_REMOVED
              : FMEvents.RECORD_CHANGED
            : typeLookup[event.eventType as keyof typeof typeLookup]
      }
    };
    // console.log(contextualizedEvent, event.value);

    return clientHandler(contextualizedEvent);
  };
};

function isValueBasedEvent(
  evt: IFirebaseWatchEvent,
  context: IFirebaseWatchContext
): evt is IValueBasedWatchEvent {
  return evt.eventType === "value";
}
