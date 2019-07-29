import { IDictionary } from "common-types";
import {
  FmEvents,
  IEventTimeContext,
  IReduxDispatch,
  IFmWatchEvent,
  IWatcherEventContext,
  IFmServerOrLocalEvent
} from "../state-mgmt";
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
export const WatchDispatcher = <T>(
  /**
   * a base/generic redux dispatch function; typically provided
   * by the frontend state management framework
   */
  coreDispatchFn: IReduxDispatch
) => (
  /** context provided by the watcher at the time in which the watcher was setup */
  watcherContext: IWatcherEventContext<T>
) => {
  if (typeof coreDispatchFn !== "function") {
    throw new FireModelError(
      `A watcher is being setup but the dispatch function is not a valid function!`,
      "firemodel/not-allowed"
    );
  }

  // Handle incoming events ...
  return async (event: IFmServerOrLocalEvent<T>): Promise<IFmWatchEvent<T>> => {
    hasInitialized[watcherContext.watcherId] = true;

    const typeLookup: IDictionary<FmEvents> = {
      child_added: FmEvents.RECORD_ADDED,
      child_removed: FmEvents.RECORD_REMOVED,
      child_changed: FmEvents.RECORD_CHANGED,
      child_moved: FmEvents.RECORD_MOVED,
      value: FmEvents.RECORD_CHANGED
    };

    let eventContext: IEventTimeContext<T>;
    let errorMessage: string;

    if (event.kind === "relationship") {
      eventContext = {
        type: event.type,
        dbPath: "not-relevant, use toLocal and fromLocal"
      };
    } else {
      // record events (both server and local)
      const recordProps =
        typeof event.value === "object"
          ? { id: event.key, ...event.value }
          : { id: event.key };

      const rec = Record.createWith(
        watcherContext.modelConstructor,
        recordProps
      );

      let type: FmEvents;
      switch (event.kind) {
        case "record":
          type = event.type;
          break;
        case "server-event":
          type =
            event.value === null
              ? FmEvents.RECORD_REMOVED
              : typeLookup[event.eventType];
          break;
        default:
          type = FmEvents.UNEXPECTED_ERROR;
          errorMessage = `The "kind" of event was not recognized [ ${
            (event as any).kind
          } ]`;
      }

      eventContext = {
        type,
        dbPath: rec.dbPath
      };
    }

    const reduxAction: IFmWatchEvent<T> = {
      ...watcherContext,
      ...event,
      ...eventContext,
      errorMessage
    };

    return coreDispatchFn(reduxAction);
  };
};
