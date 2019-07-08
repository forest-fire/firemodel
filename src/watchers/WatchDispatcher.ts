import { IReduxDispatch } from "../VuexWrapper";
import { IDictionary, createError } from "common-types";
import {
  IFirebaseWatchEvent,
  IFirebaseWatchContext,
  IValueBasedWatchEvent,
  IPathBasedWatchEvent
} from "abstracted-firebase";
import {
  FmEvents,
  IFmDispatchWatchContext,
  IFmContextualizedWatchEvent
} from "../state-mgmt";
import { Record } from "../Record";
import { hasInitialized } from "./watchInitialization";
import { FireModelError, FireModelProxyError } from "../errors";
import { capitalize } from "../util";

/**
 * **watchDispatcher**
 *
 * Wraps Firebase event detail (meager) with as much context as is possible
 */
export const WatchDispatcher = <T>(context: IFmDispatchWatchContext<T>) => (
  /** a generic redux dispatch function; called by database on event */
  clientHandler: IReduxDispatch<IFmContextualizedWatchEvent<T>>
) => {
  if (typeof clientHandler !== "function") {
    throw new FireModelError(
      `A watcher is being setup but the dispatch function is not a valid function!`,
      "firemodel/not-allowed"
    );
  }

  return (event: IValueBasedWatchEvent & IPathBasedWatchEvent) => {
    hasInitialized[context.watcherId] = true;

    const typeLookup: IDictionary = {
      child_added: FmEvents.RECORD_ADDED,
      child_removed: FmEvents.RECORD_REMOVED,
      child_changed: FmEvents.RECORD_CHANGED,
      child_moved: FmEvents.RECORD_MOVED,
      value: FmEvents.RECORD_CHANGED
    };

    const recId =
      typeof event.value === "object"
        ? { id: event.key, ...event.value }
        : { id: event.key };

    const rec = Record.createWith(
      context.modelConstructor,
      context.compositeKey
    );

    const contextualizedEvent: IFmContextualizedWatchEvent<T> = {
      ...{
        type:
          event.eventType === "value"
            ? event.value === null || event.paths === null
              ? FmEvents.RECORD_REMOVED
              : FmEvents.RECORD_CHANGED
            : typeLookup[event.eventType as keyof typeof typeLookup]
      },
      ...context,
      ...event
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
