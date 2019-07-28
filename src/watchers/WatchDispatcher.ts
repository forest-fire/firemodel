import { IReduxDispatch } from "../VuexWrapper";
import { IDictionary } from "common-types";
import {
  IValueBasedWatchEvent,
  IPathBasedWatchEvent
} from "abstracted-firebase";
import { FmEvents, IDispatchEventContext } from "../state-mgmt";
import { Record } from "../Record";
import { hasInitialized } from "./watchInitialization";
import { FireModelError } from "../errors";
import { IWatcherItem, IFmLocalEvent } from "./types";
import { IFmEvent, IFmServerEvent } from "../@types";

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
  watcherContext: IWatcherItem<T>
) => {
  if (typeof coreDispatchFn !== "function") {
    throw new FireModelError(
      `A watcher is being setup but the dispatch function is not a valid function!`,
      "firemodel/not-allowed"
    );
  }

  // Handle incoming events ...
  return async (
    event: IFmServerEvent | IFmLocalEvent<T>
  ): Promise<IFmEvent<T>> => {
    hasInitialized[watcherContext.watcherId] = true;

    const typeLookup: IDictionary = {
      child_added: FmEvents.RECORD_ADDED,
      child_removed: FmEvents.RECORD_REMOVED,
      child_changed: FmEvents.RECORD_CHANGED,
      child_moved: FmEvents.RECORD_MOVED,
      value: FmEvents.RECORD_CHANGED
    };

    const recordProps =
      typeof event.value === "object"
        ? { id: event.key, ...event.value }
        : { id: event.key };

    const rec = Record.createWith(watcherContext.modelConstructor, recordProps);

    const eventContext: IDispatchEventContext<T> = {
      type:
        watcherContext.eventFamily === "value"
          ? (event as IValueBasedWatchEvent).value === null ||
            (event as IPathBasedWatchEvent).paths === null
            ? FmEvents.RECORD_REMOVED
            : FmEvents.RECORD_CHANGED
          : (typeLookup[
              event.eventType as keyof typeof typeLookup
            ] as FmEvents),

      dbPath: rec.dbPath
    };

    /**
     * _local events_ will be explicit about the **Action**
     * they are trying to set; in comparison the server events
     * will be determined at run time (using watcher context)
     */
    if ((event as IFmLocalEvent<T>).type) {
      eventContext.type = (event as IFmLocalEvent<T>).type;
    }

    const reduxAction: IFmEvent<T> = {
      ...watcherContext,
      ...eventContext,
      ...event
    };

    return coreDispatchFn(reduxAction);
  };
};
