import { IReduxDispatch } from "./VuexWrapper";
import { IDictionary } from "common-types";
import { IFirebaseWatchEvent, IFirebaseWatchContext, IValueBasedWatchEvent } from "abstracted-firebase";
import {
  FMEvents,
  IFmDispatchWatchContext,
  IFmContextualizedWatchEvent
} from "./state-mgmt";
import { Record } from "./Record";
import { IFmRecordEvent } from "./@types/watcher-types";

// TODO: This looks ugly, find time to refactor
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
export const ModelDispatchTransformer = <T>(
  context: IFmDispatchWatchContext<T>
) => (clientHandler: IReduxDispatch<IFmContextualizedWatchEvent<T>>) => {
  if (typeof clientHandler !== "function") {
    const e = new Error(
      `A watcher is being setup but the dispatch function is not valid or not set!`
    );
    e.name = "FireModel::NotAllowed";
    throw e;
  }
  return (event: IValueBasedWatchEvent) => {
    const typeLookup: IDictionary = {
      child_added: FMEvents.RECORD_ADDED,
      child_removed: FMEvents.RECORD_REMOVED,
      child_changed: FMEvents.RECORD_CHANGED,
      child_moved: FMEvents.RECORD_MOVED
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
      if (e.code === "record/not-ready") {
        // TODO: this may need checking
        compositeKey = { id: "" };
      }
    }
    const contextualizedEvent: IFmContextualizedWatchEvent<T> = {
      ...context,
      ...event,
      ...{
        compositeKey,
        type:
          event.eventType === "value"
            ? event.value === null
              ? FMEvents.RECORD_REMOVED
              : FMEvents.RECORD_CHANGED
            : typeLookup[event.eventType as keyof typeof typeLookup]
      }
    };

    return clientHandler(contextualizedEvent);
  };
};


function isValueBasedEvent(
  evt: IFirebaseWatchEvent,
  context: IFirebaseWatchContext
): evt is IValueBasedWatchEvent {
  return evt.eventType === "value";
}